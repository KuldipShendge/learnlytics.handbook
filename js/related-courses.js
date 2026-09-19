(() => {
  const catalog = {
    da: {
      id: 'data-analyst', source: '.card-da-interview',
      title: 'Data & BI Analyst Interview Kit', category: 'DATA ANALYTICS',
      description: 'Prepare for analytics interviews with technical questions, scenarios and detailed answers.',
      stats: ['8 Subjects', '2000 Interview QS'],
    },
    ds: {
      id: 'data-science', source: '.card-ds',
      title: 'Data Scientist & Gen AI Complete Kit', category: 'DATA SCIENCE & GEN AI',
      description: 'Prepare for data science interviews, from core foundations to Generative AI.',
      stats: ['7 Modules', '60 Resources'],
    },
    ml: {
      id: 'ai-automation', source: '.card-mle',
      title: 'Machine Learning Engineer Complete Kit', category: 'MACHINE LEARNING',
      description: 'Learn, practise and prepare with handbooks, workbooks and solution manuals.',
      stats: ['7 Modules', '60 Resources'],
    },
  };
  const destinations = {
    'ai-automation': ['da', 'ds'],
    'data-science': ['da', 'ml'],
    'ds-genai-ml': ['da', 'ds', 'ml'],
    'data-analyst': ['ml', 'ds'],
  };

  function courseCard(key) {
    const course = catalog[key];
    const source = document.querySelector(course.source);
    const article = document.createElement('article');
    article.className = 'related-course-card';
    article.innerHTML = `
      <div class="related-course-art"></div>
      <div class="related-course-content">
        <p class="related-course-category">${course.category}</p>
        <h3>${course.title}</h3>
        <p class="related-course-description">${course.description}</p>
        <ul class="related-course-stats">${course.stats.map(stat => `<li>${stat}</li>`).join('')}</ul>
        <div class="related-course-footer">
          <div class="related-course-price"><strong></strong><span>One-time payment</span></div>
          <a class="related-course-link">Explore Kit <span aria-hidden="true">&rarr;</span></a>
        </div>
      </div>`;
    const sourceImage = source?.querySelector('.bundle-card-illustration img');
    if (sourceImage) {
      const image = sourceImage.cloneNode(false);
      image.alt = course.title;
      image.loading = 'lazy';
      article.querySelector('.related-course-art').append(image);
    }
    const price = source?.querySelector('.bundle-price-large');
    const updatePrice = () => {
      article.querySelector('.related-course-price strong').textContent = price?.textContent.trim() || '\u20B9499';
    };
    updatePrice();
    if (price) new MutationObserver(updatePrice).observe(price, { childList: true, characterData: true, subtree: true });
    const link = article.querySelector('a');
    link.href = new URL(`index.html#${course.id}`, document.baseURI).href;
    link.setAttribute('aria-label', `Explore ${course.title}`);
    link.addEventListener('click', event => {
      if (event.ctrlKey || event.metaKey || event.shiftKey || event.altKey || event.button !== 0) return;
      event.preventDefault();
      openDetail(course.id);
    });
    return article;
  }

  function combinedCard() {
    const article = document.createElement('article');
    article.className = 'related-course-card related-course-combo';
    article.innerHTML = `
      <div class="related-course-art related-combo-art" aria-hidden="true">
        <span class="related-combo-badge">ALL-IN-ONE COMPLETE KIT</span>
        <div class="related-combo-books"><span>DS<small>Data Science</small></span><span>GEN AI<small>Generative AI</small></span><span>ML<small>Machine Learning</small></span></div>
      </div>
      <div class="related-course-content">
        <p class="related-course-category">COMPLETE KIT</p>
        <h3>DS + Gen AI + ML Complete Kit</h3>
        <p class="related-course-description">Explore data science, Generative AI and machine learning in one complete kit.</p>
        <ul class="related-course-stats"><li>9 Modules</li><li>80 Resources</li></ul>
        <div class="related-course-footer">
          <div class="related-course-price"><strong>\u20B9899</strong><span>One-time payment</span></div>
          <a class="related-course-link" href="index.html#ds-genai-ml" aria-label="Explore DS + Gen AI + ML Complete Kit">Explore Kit <span aria-hidden="true">&rarr;</span></a>
        </div>
      </div>`;
    article.querySelector('a').addEventListener('click', event => {
      if (event.ctrlKey || event.metaKey || event.shiftKey || event.altKey || event.button !== 0) return;
      event.preventDefault();
      openDetail('ds-genai-ml');
    });
    return article;
  }

  Object.entries(destinations).forEach(([id, keys]) => {
    const root = document.getElementById(`course-${id}`);
    if (!root) return;
    const section = document.createElement('section');
    section.className = 'related-courses';
    section.setAttribute('aria-labelledby', `related-${id}-title`);
    section.innerHTML = `<header class="related-courses-heading"><span>CONTINUE YOUR LEARNING</span><h2 id="related-${id}-title">Explore Other Courses</h2><p>Find your next kit, or bring more skills together.</p></header><div class="related-courses-grid"></div>`;
    const grid = section.querySelector('.related-courses-grid');
    keys.forEach(key => grid.append(courseCard(key)));
    if (id !== 'ds-genai-ml') grid.append(combinedCard());
    root.append(section);
  });
})();
