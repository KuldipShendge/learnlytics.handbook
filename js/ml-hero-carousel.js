(() => {
  document.querySelectorAll('.ml-hero-carousel').forEach(carousel => {
  const slides = [...carousel.querySelectorAll('.ml-hero-slide')];
  const dots = [...carousel.querySelectorAll('.ml-hero-dots button')];
  const play = carousel.querySelector('.ml-hero-play');
  const status = carousel.querySelector('.ml-hero-status');
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  let index = 0;
  let paused = reducedMotion.matches;
  let visible = false;
  let hovered = false;
  let focused = false;
  let timer;
  let touchStart;

  function schedule() {
    clearTimeout(timer);
    if (!paused && visible && !hovered && !focused && !document.hidden) {
      timer = setTimeout(() => show(index + 1), 5000);
    }
  }
  function show(next, manual = false) {
    index = (next + slides.length) % slides.length;
    slides.forEach((slide, i) => { slide.hidden = i !== index; });
    dots.forEach((dot, i) => dot.setAttribute('aria-current', String(i === index)));
    if (manual) status.textContent = `Image ${index + 1} of ${slides.length}`;
    schedule();
  }
  function updatePlay() {
    play.textContent = paused ? '\u25B6' : '\u23F8';
    play.setAttribute('aria-label', paused ? 'Play image slideshow' : 'Pause image slideshow');
    schedule();
  }
  carousel.querySelector('.ml-hero-prev').addEventListener('click', () => show(index - 1, true));
  carousel.querySelector('.ml-hero-next').addEventListener('click', () => show(index + 1, true));
  dots.forEach((dot, i) => dot.addEventListener('click', () => show(i, true)));
  play.addEventListener('click', () => { paused = !paused; updatePlay(); });
  carousel.addEventListener('keydown', event => {
    if (event.key === 'ArrowLeft' || event.key === 'ArrowRight') {
      event.preventDefault();
      show(index + (event.key === 'ArrowLeft' ? -1 : 1), true);
    }
  });
  carousel.addEventListener('mouseenter', () => { hovered = true; schedule(); });
  carousel.addEventListener('mouseleave', () => { hovered = false; schedule(); });
  carousel.addEventListener('focusin', () => { focused = true; schedule(); });
  carousel.addEventListener('focusout', event => {
    focused = carousel.contains(event.relatedTarget);
    schedule();
  });
  carousel.addEventListener('touchstart', event => {
    const touch = event.changedTouches[0];
    touchStart = { x: touch.clientX, y: touch.clientY };
    clearTimeout(timer);
  }, { passive: true });
  carousel.addEventListener('touchend', event => {
    if (!touchStart) return;
    const touch = event.changedTouches[0];
    const dx = touch.clientX - touchStart.x;
    const dy = touch.clientY - touchStart.y;
    if (Math.abs(dx) > 40 && Math.abs(dx) > Math.abs(dy)) show(index + (dx < 0 ? 1 : -1), true);
    touchStart = null;
    schedule();
  }, { passive: true });
  carousel.addEventListener('touchcancel', () => { touchStart = null; schedule(); });
  document.addEventListener('visibilitychange', schedule);
  reducedMotion.addEventListener('change', event => { paused = event.matches; updatePlay(); });
  new IntersectionObserver(entries => {
    visible = entries[0].isIntersecting;
    schedule();
  }, { threshold: 0.15 }).observe(carousel);
  updatePlay();
  });
})();
