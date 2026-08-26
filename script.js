document.addEventListener("DOMContentLoaded", () => {
  const track = document.getElementById("carouselTrack");
  const originalSet = document.getElementById("carouselSet");

  if (!track || !originalSet) return;

  const duplicateSet = originalSet.cloneNode(true);
  duplicateSet.removeAttribute("id");
  track.appendChild(duplicateSet);

  let currentPosition = 0;
  let stepDistance = 0;
  let moving = false;

  const MOVE_DISTANCE = 1;
  const MOVE_SPEED = 4;
  const PAUSE_TIME = 900;

  function measure() {
    stepDistance = originalSet.scrollWidth / 6;
  }

  function moveOneStep() {
    if (moving || stepDistance <= 0) return;

    moving = true;

    const targetPosition = currentPosition + stepDistance;
    const startPosition = currentPosition;
    const duration = 450;
    const startTime = performance.now();

    function animate(now) {
      const progress = Math.min((now - startTime) / duration, 1);

      currentPosition =
        startPosition +
        (targetPosition - startPosition) * progress;

      if (currentPosition >= originalSet.scrollWidth) {
        currentPosition -= originalSet.scrollWidth;
        track.style.transform = `translate3d(${-currentPosition}px, 0, 0)`;
      } else {
        track.style.transform = `translate3d(${-currentPosition}px, 0, 0)`;
      }

      if (progress < 1) {
        requestAnimationFrame(animate);
      } else {
        moving = false;

        setTimeout(() => {
          moveOneStep();
        }, PAUSE_TIME);
      }
    }

    requestAnimationFrame(animate);
  }

  window.addEventListener("load", () => {
    measure();
    moveOneStep();
  });

  window.addEventListener("resize", () => {
    measure();
  });

  const images = track.querySelectorAll("img");
  let loaded = 0;

  if (images.length === 0) {
    measure();
    moveOneStep();
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
              moveOneStep();
            }
          },
          { once: true }
        );
      }
    });

    if (loaded === images.length) {
      measure();
      moveOneStep();
    }
  }
});
