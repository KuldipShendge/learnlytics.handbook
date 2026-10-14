(() => {
  const catalog = window.LearnlyticsCatalog;
  const destinations = {
    'ai-automation': ['data-analyst', 'data-science', 'ds-genai-ml'],
    'data-science': ['data-analyst', 'ai-automation', 'ds-genai-ml'],
    'ds-genai-ml': ['data-analyst', 'data-science', 'ai-automation'],
    'data-analyst': ['ai-automation', 'data-science', 'ds-genai-ml'],
  };
  function courseCard(id) {
    const course = catalog.get(id);
    const combo = id === 'ds-genai-ml';
    const title = course.relatedTitle || course.title;
    const article = document.createElement('article');
    article.className = 'related-course-card' + (combo ? ' related-course-combo' : '');
    article.innerHTML = `
      <div class="related-course-art${combo ? ' related-combo-art' : ''}"></div>
      <div class="related-course-content">
        <p class="related-course-category"></p><h3></h3>
        <p class="related-course-description"></p><ul class="related-course-stats"></ul>
        <div class="related-course-footer">
          <div class="related-course-price"><strong data-catalog-price="${id}"></strong><span>One-time payment</span></div>
          <a class="related-course-link">Explore Kit <span aria-hidden="true">&rarr;</span></a>
        </div>
      </div>`;
    article.querySelector('.related-course-category').textContent = combo ? 'COMPLETE KIT' : course.category;
    article.querySelector('h3').textContent = title;
    article.querySelector('.related-course-description').textContent = course.description;
    const stats = course.stats.slice(0, 2);
    if (id === 'data-analyst') stats[1] = '2200+ Interview QS';
    stats.forEach(stat => {
      const item = document.createElement('li');
      item.textContent = stat;
      article.querySelector('ul').append(item);
    });
    const art = article.querySelector('.related-course-art');
    if (course.image) {
      const image = document.createElement('img');
      image.src = course.image;
      image.alt = title;
      image.loading = 'lazy';
      image.width = course.width;
      image.height = course.height;
      art.append(image);
    } else {
      art.setAttribute('aria-hidden', 'true');
      art.innerHTML = '<span class="related-combo-badge">ALL-IN-ONE COMPLETE KIT</span><div class="related-combo-books"><span>DS<small>Data Science</small></span><span>GEN AI<small>Generative AI</small></span><span>ML<small>Machine Learning</small></span></div>';
    }
    const link = article.querySelector('a');
    link.href = catalog.href(id);
    link.setAttribute('aria-label', `Explore ${title}`);
    link.addEventListener('click', event => {
      if (event.ctrlKey || event.metaKey || event.shiftKey || event.altKey || event.button !== 0) return;
      event.preventDefault();
      openDetail(id);
    });
    catalog.syncPrices(article);
    return article;
  }
  Object.entries(destinations).forEach(([id, ids]) => {
    const root = document.getElementById(`course-${id}`);
    if (!root) return;
    const section = document.createElement('section');
    section.className = 'related-courses';
    section.setAttribute('aria-labelledby', `related-${id}-title`);
    section.innerHTML = `<header class="related-courses-heading"><span>CONTINUE YOUR LEARNING</span><h2 id="related-${id}-title">Explore Other Courses</h2><p>Find your next kit, or bring more skills together.</p></header><div class="related-courses-grid"></div>`;
    const grid = section.querySelector('.related-courses-grid');
    ids.forEach(courseId => grid.append(courseCard(courseId)));
    root.append(section);
  });
})();
