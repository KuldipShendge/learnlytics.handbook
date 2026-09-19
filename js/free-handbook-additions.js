(() => {
  const books = {
    'eda-part01': {
      title: 'Exploratory Data Analysis Part-01',
      description: 'Explore data, understand patterns and practise interview questions.',
      image: 'free-eda-handbook-v1.webp',
      link: 'https://drive.google.com/file/d/10yTUHmbl0RkS_ZLxqB48KYbRpoWo-cAD/view?usp=sharing',
    },
    'big-data': {
      title: 'Big Data Management & Analytics',
      description: 'A free handbook for your big data and analytics learning journey.',
      image: 'free-big-data-handbook-v1.webp',
      link: 'https://drive.google.com/file/d/1C0bKsKoY0k0ZtPnFFdDHu6qSpLt1VC71/view?usp=drive_link',
    },
    'analytics-ground-zero': {
      title: 'ANALYTICS–GROUND ZERO',
      description: 'Start building your analytics foundations with this free handbook.',
      image: 'free-analytics-ground-zero-v1.webp',
      link: 'https://drive.google.com/file/d/1DiHU4m1TVkrFKVlaFtCNYWf1aZ5JKmoY/view?usp=sharing',
    },
  };
  window.freeHandbookAdditions = books;
  document.querySelectorAll('#freeResourcesSection .free-resources-grid, #freeHandbooksSection .free-handbooks-grid').forEach(grid => {
    Object.entries(books).forEach(([key, book]) => {
      const card = document.createElement('article');
      card.className = 'new-free-book-card';
      card.dataset.freeBook = key;
      card.innerHTML = `<img src="images/light-theme/${book.image}" alt="${book.title} handbook cover" width="1024" height="1536" loading="lazy"><div class="new-free-book-copy"><span>100% FREE</span><h3>${book.title}</h3><p>${book.description}</p><button type="button" aria-label="Free Download ${book.title}">Download Free <span aria-hidden="true">&rarr;</span></button></div>`;
      const button = card.querySelector('button');
      if (grid.closest('#freeResourcesSection')) {
        if (key === 'eda-part01') {
          button.addEventListener('click', () => openDetail('data-science'));
        } else {
          const link = document.createElement('a');
          link.className = 'dashboard-free-download';
          link.href = book.link;
          link.target = '_blank';
          link.rel = 'noopener noreferrer';
          link.setAttribute('aria-label', button.getAttribute('aria-label'));
          link.innerHTML = button.innerHTML;
          button.replaceWith(link);
        }
      } else {
        button.addEventListener('click', () => openModal(key));
      }
      grid.append(card);
    });
  });
})();
