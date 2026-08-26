document.addEventListener("DOMContentLoaded", () => {
  const track = document.getElementById("carouselTrack");
  const originalSet = document.getElementById("carouselSet");

  if (!track || !originalSet) return;

  // Create duplicate set for continuous looping
  const duplicateSet = originalSet.cloneNode(true);
  duplicateSet.removeAttribute("id");

  // Remove the extra left padding at the duplicate boundary.
  // This keeps the gap between the last original card
  // and the first duplicate card equal to the normal card gap.
  duplicateSet.style.marginLeft = "-28px";

  track.appendChild(duplicateSet);

  let position = 0;
  let stepDistance = 0;
  let loopDistance = 0;
  let isMoving = false;

  // Movement settings
  const MOVE_TIME = 1200;   // slow movement duration
  const PAUSE_TIME = 1000; // pause after each step

  function measure() {
    const firstCard = originalSet.querySelector(".country-card");

    if (!firstCard) return;

    const cardWidth = firstCard.getBoundingClientRect().width;

    const setStyles = window.getComputedStyle(originalSet);
    const gap = parseFloat(setStyles.columnGap || setStyles.gap || "0");

    // One complete card + normal gap
    stepDistance = cardWidth + gap;

    // Six cards make one complete original set.
    // Boundary correction removes the duplicated 28px padding.
    loopDistance = originalSet.getBoundingClientRect().width - 28;
  }

  function moveStep() {
    if (isMoving || stepDistance <= 0) return;

    isMoving = true;

    const startPosition = position;
    const targetPosition = position + stepDistance;

    const startTime = performance.now();

    function animate(now) {
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / MOVE_TIME, 1);

      // Slow start + slow finish, then a definite stop.
      const eased =
        progress < 0.5
          ? 2 * progress * progress
          : 1 - Math.pow(-2 * progress + 2, 2) / 2;

      position =
        startPosition +
        (targetPosition - startPosition) * eased;

      // Seamless loop at the exact end of the six-card set
      if (position >= loopDistance) {
        position -= loopDistance;
      }

      track.style.transform =
        `translate3d(${-position}px, 0, 0)`;

      if (progress < 1) {
        requestAnimationFrame(animate);
      } else {
        isMoving = false;

        // Pause after every step
        setTimeout(() => {
          moveStep();
        }, PAUSE_TIME);
      }
    }

    requestAnimationFrame(animate);
  }

  // Recalculate dimensions after images load
  window.addEventListener("load", () => {
    measure();
    moveStep();
  });

  window.addEventListener("resize", () => {
    measure();
  });

  const images = track.querySelectorAll("img");
  let loaded = 0;

  if (images.length === 0) {
    measure();
    moveStep();
  } else {
    images.forEach((img) => {
      if (img.complete) {
        loaded++;
      } else {
        img.addEventListener(
          "load",
          () => {
            loaded++;

            if (loaded === images.length) {
              measure();
              moveStep();
            }
          },
          { once: true }
        );
      }
    });

    if (loaded === images.length) {
      measure();
      moveStep();
    }
  }
});
