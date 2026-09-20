(() => {
  const root = document.getElementById('course-ds-genai-ml');
  if (!root) return;
  const sticky = root.querySelector('.dakit-sticky-mobile-cta');
  const hero = root.querySelector('.dakit-hero');
  if (sticky && hero) {
    new IntersectionObserver(entries => {
      sticky.classList.toggle('visible', root.classList.contains('active') && !entries[0].isIntersecting);
    }, { threshold: 0.1 }).observe(hero);
  }
})();
