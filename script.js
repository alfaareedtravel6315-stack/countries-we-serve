
document.addEventListener("DOMContentLoaded", () => {
  const track = document.getElementById("carouselTrack");
  const originalSet = document.getElementById("carouselSet");

  if (!track || !originalSet) return;

  // Create the second identical set so the carousel can loop continuously.
  const duplicateSet = originalSet.cloneNode(true);
  duplicateSet.removeAttribute("id");
  track.appendChild(duplicateSet);

  let offset = 0;
  let lastTime = performance.now();
  let loopDistance = 0;
  let running = true;

  const SPEED = 55; // pixels per second

  function measure() {
    const firstSetWidth = originalSet.getBoundingClientRect().width;
    const styles = window.getComputedStyle(track);
    const gap = parseFloat(styles.columnGap || styles.gap || "0");
    loopDistance = firstSetWidth + gap;
  }

  function animate(now) {
    const delta = Math.min(now - lastTime, 50);
    lastTime = now;

    if (running && loopDistance > 0) {
      offset += (SPEED * delta) / 1000;

      // Reset exactly when the first complete set has passed.
      // This prevents the white gap/jump seen in the previous version.
      if (offset >= loopDistance) {
        offset -= loopDistance;
      }

      track.style.transform = `translate3d(${-offset}px, 0, 0)`;
    }

    requestAnimationFrame(animate);
  }

  // Re-measure after images/layout settle.
  window.addEventListener("load", measure);
  window.addEventListener("resize", measure);

  const images = track.querySelectorAll("img");
  let loaded = 0;

  if (images.length === 0) {
    measure();
  } else {
    images.forEach((img) => {
      if (img.complete) {
        loaded++;
      } else {
        img.addEventListener("load", () => {
          loaded++;
          if (loaded === images.length) measure();
        }, { once: true });
      }
    });

    if (loaded === images.length) measure();
  }

  // Pause while the mouse is over the carousel; resume when it leaves.
  const windowEl = document.querySelector(".carousel-window");
  if (windowEl) {
    windowEl.addEventListener("mouseenter", () => {
      running = false;
    });

    windowEl.addEventListener("mouseleave", () => {
      running = true;
      lastTime = performance.now();
    });
  }

  requestAnimationFrame(animate);
});
