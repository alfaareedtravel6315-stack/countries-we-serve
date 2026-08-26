/* =========================================================
   COUNTRIES WE SERVE — AUTO SLIDER
   Sequence: Saudi → Dubai → Oman → Qatar → Kuwait → Bahrain
   ========================================================= */

(function () {
  "use strict";

  const slider = document.querySelector("[data-slider]");
  const track = document.querySelector("[data-track]");

  if (!slider || !track) return;

  const originalCards = Array.from(track.querySelectorAll(".country-card"));
  if (originalCards.length <= 1) return;

  let currentIndex = 0;
  let timer = null;

  function getCardStep() {
    const firstCard = track.querySelector(".country-card");
    if (!firstCard) return 0;

    const cardWidth = firstCard.getBoundingClientRect().width;
    const styles = window.getComputedStyle(track);
    const gap = parseFloat(styles.columnGap || styles.gap || "0");

    return cardWidth + gap;
  }

  function moveSlider() {
    const step = getCardStep();
    if (!step) return;

    currentIndex += 1;

    if (currentIndex >= originalCards.length) {
      track.style.transition = "none";
      currentIndex = 0;
      track.style.transform = "translate3d(0, 0, 0)";

      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          track.style.transition = "";
        });
      });

      return;
    }

    track.style.transform =
      "translate3d(" + (-currentIndex * step) + "px, 0, 0)";
  }

  function startSlider() {
    stopSlider();
    timer = window.setInterval(moveSlider, 3000);
  }

  function stopSlider() {
    if (timer) {
      window.clearInterval(timer);
      timer = null;
    }
  }

  window.addEventListener("resize", function () {
    track.style.transition = "none";
    track.style.transform =
      "translate3d(" + (-currentIndex * getCardStep()) + "px, 0, 0)";

    requestAnimationFrame(() => {
      track.style.transition = "";
    });
  });

  slider.addEventListener("mouseenter", stopSlider);
  slider.addEventListener("mouseleave", startSlider);

  startSlider();
})();
