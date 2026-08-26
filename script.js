document.addEventListener("DOMContentLoaded", () => {
  const track = document.getElementById("carouselTrack");
  const originalSet = document.getElementById("carouselSet");

  if (!track || !originalSet) return;

  // Create one duplicate set for continuous looping
  const duplicateSet = originalSet.cloneNode(true);
  duplicateSet.removeAttribute("id");
  track.appendChild(duplicateSet);

  let position = 0;
  let stepDistance = 0;
  let loopDistance = 0;
  let moveTimer = null;
  let isMoving = false;

  // Premium step movement
  const MOVE_TIME = 1100;
  const PAUSE_TIME = 1400;

  function setupLayout() {
    const carouselWindow = document.querySelector(".carousel-window");
    const firstCard = originalSet.querySelector(".country-card");

    if (!carouselWindow || !firstCard) return;

    const viewportWidth = carouselWindow.getBoundingClientRect().width;

    // Keep the existing spacing system:
    // Desktop: 28px
    // Mobile: 20px / 16px according to the existing CSS
    const setStyles = window.getComputedStyle(originalSet);
    const paddingLeft = parseFloat(setStyles.paddingLeft) || 0;
    const paddingRight = parseFloat(setStyles.paddingRight) || 0;
    const gap = parseFloat(setStyles.columnGap || setStyles.gap || "0");

    /*
      Fit exactly 5 FULL cards inside the visible area.

      Available width =
      viewport - left padding - right padding - four gaps
    */
    const availableWidth =
      viewportWidth -
      paddingLeft -
      paddingRight -
      (gap * 4);

    const cardWidth = availableWidth / 5;

    // Set the calculated width through JavaScript.
    // CSS remains untouched.
    originalSet.querySelectorAll(".country-card").forEach((card) => {
      card.style.width = `${cardWidth}px`;
      card.style.flexBasis = `${cardWidth}px`;
    });

    duplicateSet.querySelectorAll(".country-card").forEach((card) => {
      card.style.width = `${cardWidth}px`;
      card.style.flexBasis = `${cardWidth}px`;
    });

    // Keep duplicate-set boundary spacing normal.
    duplicateSet.style.marginLeft = `-${paddingLeft}px`;

    // One card + one normal gap = one exact movement step.
    stepDistance = cardWidth + gap;

    /*
      Six cards make one complete loop.
      This keeps the first duplicate card perfectly aligned
      with the original first card.
    */
    loopDistance = stepDistance * 6;

    // Keep current position inside the new loop range after resize.
    if (position >= loopDistance) {
      position = position % loopDistance;
    }

    track.style.transform =
      `translate3d(${-position}px, 0, 0)`;
  }

  // Premium easing:
  // starts firmly, moves slowly, then settles cleanly.
  function premiumEase(progress) {
    return 1 - Math.pow(1 - progress, 3);
  }

  function moveOneStep() {
    if (isMoving || stepDistance <= 0) return;

    isMoving = true;

    const startPosition = position;
    const targetPosition = startPosition + stepDistance;
    const startTime = performance.now();

    function animate(now) {
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / MOVE_TIME, 1);

      const easedProgress = premiumEase(progress);

      let currentPosition =
        startPosition +
        (stepDistance * easedProgress);

      // Exact loop point after the 6th card
      if (currentPosition >= loopDistance) {
        currentPosition -= loopDistance;
      }

      position = currentPosition;

      track.style.transform =
        `translate3d(${-position}px, 0, 0)`;

      if (progress < 1) {
        requestAnimationFrame(animate);
      } else {
        /*
          Force the exact final position.
          This prevents half-card alignment.
        */
        position = targetPosition;

        if (position >= loopDistance) {
          position -= loopDistance;
        }

        track.style.transform =
          `translate3d(${-position}px, 0, 0)`;

        isMoving = false;

        // Pause after every complete card movement.
        moveTimer = setTimeout(() => {
          moveOneStep();
        }, PAUSE_TIME);
      }
    }

    requestAnimationFrame(animate);
  }

  function startCarousel() {
    clearTimeout(moveTimer);
    setupLayout();

    // Give the viewer a moment to see the first 5 cards.
    moveTimer = setTimeout(() => {
      moveOneStep();
    }, PAUSE_TIME);
  }

  // Wait until images are ready before calculating exact card sizes.
  const images = track.querySelectorAll("img");
  let loadedImages = 0;

  if (images.length === 0) {
    startCarousel();
  } else {
    images.forEach((img) => {
      if (img.complete) {
        loadedImages++;

        if (loadedImages === images.length) {
          startCarousel();
        }
      } else {
        img.addEventListener(
          "load",
          () => {
            loadedImages++;

            if (loadedImages === images.length) {
              startCarousel();
            }
          },
          { once: true }
        );
      }
    });
  }

  // Recalculate card size if browser/window size changes.
  window.addEventListener("resize", () => {
    setupLayout();
  });
});
