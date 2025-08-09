document.getElementById('searchForm')?.addEventListener('submit', function (e) {
  const keyword = document.getElementById('searchInput').value.trim();
  if (keyword.length < 2) {
    alert("Please enter at least 2 characters");
    e.preventDefault();
  }
});

document.getElementById('showRanking')?.addEventListener('click', () => {
  fetch('/api/ranking')
    .then(res => res.json())
    .then(data => {
      const ul = document.getElementById('rankingList');
      ul.innerHTML = '';
      data.forEach(book => {
        const li = document.createElement('li');
        li.textContent = `${book.title} (Avg: ${book.avgRating})`;
        ul.appendChild(li);
      });
      document.getElementById('rankingPopup').style.display = 'block';
    });
});

document.getElementById('closePopup')?.addEventListener('click', () => {
  document.getElementById('rankingPopup').style.display = 'none';
});
