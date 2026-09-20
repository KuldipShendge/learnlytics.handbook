(() => {
  const mobile = window.matchMedia('(max-width: 768px)');
  const courses = ['data-analyst', 'ai-automation', 'data-science', 'ds-genai-ml'];
  courses.forEach(id => {
    const root = document.getElementById('course-' + id);
    const inner = root?.querySelector('.dakit-hero-inner');
    if (!inner) return;
    const selectors = [
      '.dakit-hero-badge', '.dakit-hero-title', '.dakit-hero-subtitle', '.dakit-hero-desc',
      '.ml-hero-carousel', '.dakit-hero-path-badge', '.dakit-hero-price-timer-row',
      '.dakit-hero-badges', '.dakit-hero-cta-wrap', '.dakit-hero-support-row',
      '.dakit-sql-addon-btn', '.dakit-hero-icons-mobile', '.dakit-delivery-steps-vertical'
    ];
    const items = selectors.map(selector => inner.querySelector(selector)).filter(Boolean).map(node => {
      const marker = document.createComment('Desktop hero position');
      node.before(marker);
      return {node, marker};
    });
    const stack = document.createElement('div');
    stack.className = 'course-mobile-hero-stack';
    inner.append(stack);
    function arrange() {
      if (mobile.matches) items.forEach(({node}) => stack.append(node));
      else items.forEach(({node, marker}) => marker.after(node));
    }
    mobile.addEventListener('change', arrange);
    arrange();
  });
})();
