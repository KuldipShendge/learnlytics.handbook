(() => {
  const books = Object.fromEntries(Object.entries(window.LearnlyticsCatalog.freeBooks).filter(([, book]) => book.link));
  window.freeHandbookAdditions = books;
  document.querySelectorAll('#freeHandbooksSection .free-handbooks-grid').forEach(grid => {
    Object.entries(books).forEach(([key, book]) => {
      const card = document.createElement('article');
      card.className = 'new-free-book-card';
      card.dataset.freeBook = key;
      card.innerHTML = `<img src="images/light-theme/${book.image}" alt="${book.title} handbook cover" width="1024" height="1536" loading="lazy"><div class="new-free-book-copy"><span>100% FREE</span><h3>${book.title}</h3><p>${book.description}</p><button type="button" aria-label="Free Download ${book.title}">Download Free <span aria-hidden="true">&rarr;</span></button></div>`;
      const button = card.querySelector('button');
      button.addEventListener('click', () => openModal(key));
      grid.append(card);
    });
  });
})();
