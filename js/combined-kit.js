(() => {
  const root = document.getElementById('course-ds-genai-ml');
  if (!root) return;
  const dialog = document.createElement('dialog');
  dialog.className = 'combined-kit-info';
  dialog.setAttribute('aria-labelledby', 'combined-kit-info-title');
  dialog.innerHTML = '<p class="combined-kit-eyebrow">DS + GEN AI + ML COMPLETE KIT</p><h2 id="combined-kit-info-title">Registration opens soon</h2><p>9 modules, 24 parts and 80 resources.<br>The complete kit will be available for ₹899.</p><button type="button" autofocus>Back to the kit</button>';
  document.body.append(dialog);
  dialog.querySelector('button').addEventListener('click', () => dialog.close());
  dialog.addEventListener('click', event => {
    const bounds = dialog.getBoundingClientRect();
    if (event.target === dialog && (event.clientX < bounds.left || event.clientX > bounds.right || event.clientY < bounds.top || event.clientY > bounds.bottom)) dialog.close();
  });
  window.openCombinedKitInfo = () => { if (!dialog.open) dialog.showModal(); };
  const sticky = root.querySelector('.dakit-sticky-mobile-cta');
  const hero = root.querySelector('.dakit-hero');
  if (sticky && hero) {
    new IntersectionObserver(entries => {
      sticky.classList.toggle('visible', root.classList.contains('active') && !entries[0].isIntersecting);
    }, { threshold: 0.1 }).observe(hero);
  }
})();
