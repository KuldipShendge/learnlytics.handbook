/* Homepage interactions. Product routing, free-download dialogs and support remain shared. */
(() => {
  const home = document.getElementById('coursesMenuSection');
  if (!home) return;
  home.querySelectorAll('[data-home-course-link]').forEach(link => {
    link.href = window.LearnlyticsCatalog.href(link.dataset.homeCourseLink);
  });
  if (location.protocol === 'file:') home.querySelector('[data-home-help]').href = 'index.html#help';
  home.addEventListener('click', event => {
    const link = event.target.closest('a');
    if (!link || event.defaultPrevented || event.button !== 0 || event.ctrlKey || event.metaKey || event.shiftKey || event.altKey) return;
    if (link.dataset.homeCourseLink) {
      event.preventDefault();
      openDetail(link.dataset.homeCourseLink);
    } else if (link.dataset.homeDownload) {
      event.preventDefault();
      openModal(link.dataset.homeDownload);
    } else if (link.hasAttribute('data-home-help')) {
      event.preventDefault();
      openDetail('help');
    } else if (['#home-kits', '#freeResourcesSection'].includes(link.getAttribute('href'))) {
      // Stay on the current home URL instead of creating a product-router history entry.
      event.preventDefault();
      const section = document.querySelector(link.getAttribute('href'));
      section.scrollIntoView({ behavior: matchMedia('(prefers-reduced-motion: reduce)').matches ? 'instant' : 'smooth', block: 'start' });
      const heading = section.querySelector('h2');
      heading.tabIndex = -1;
      heading.focus({ preventScroll: true });
    }
  });
})();
