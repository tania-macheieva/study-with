document.addEventListener("DOMContentLoaded", function() {
  let displayedCourses = 6;
  let currentCourses = [...coursesData];

  // Функція фільтрації курсів
  function filterCourses() {
      let filteredCourses = [...currentCourses]; // Використовуємо поточні результати пошуку

      // Отримуємо вибрані теми
      const selectedThemes = Array.from(document.querySelectorAll('input[name^="theme-option-"]:checked'))
          .map(checkbox => checkbox.nextElementSibling.textContent.trim());

      // Фільтрація за темами
      if (selectedThemes.length > 0) {
          filteredCourses = filteredCourses.filter(course => 
              course.themes.some(theme => selectedThemes.includes(theme))
          );
      }

      // Отримуємо вибрані фільтри ціни
      const selectedPrices = Array.from(document.querySelectorAll('input[name^="price-"]:checked'))
          .map(checkbox => checkbox.name);

      // Фільтрація за ціною
      if (selectedPrices.length > 0) {
          filteredCourses = filteredCourses.filter(course => {
              if (selectedPrices.includes('price-free') && course.price === 0) return true;
              if (selectedPrices.includes('price-paid') && course.price > 0) return true;
              return false;
          });
      }

      // Отримуємо вибрані рівні
      const selectedLevels = Array.from(document.querySelectorAll('input[name^="level-"]:checked'))
          .map(checkbox => checkbox.name);

      // Фільтрація за рівнем
      if (selectedLevels.length > 0) {
          filteredCourses = filteredCourses.filter(course => 
              selectedLevels.includes(course.level)
          );
      }

      currentCourses = filteredCourses;
      displayedCourses = 6;
      renderCourses();
      updateResultsCount();
  }

  function renderCourses() {
    const coursesToShow = currentCourses.slice(0, displayedCourses);
    const coursesContainer = document.querySelector(".courses");
    coursesContainer.innerHTML = '';

    if (coursesToShow.length === 0) {
        coursesContainer.innerHTML = '<p>Курсів не знайдено</p>';
        return;
    }

    // Створюємо обгортку для сітки курсів
    coursesContainer.style.display = 'grid';
    coursesContainer.style.gridTemplateColumns = 'repeat(3, 1fr)';
    coursesContainer.style.gap = '40px';

    coursesToShow.forEach(course => {
        const courseHTML = `
            <div class="course_group">
                <div class="course_name">${course.name}</div>
                <div class="description">${course.description}</div>










                
                <div class="group-27">
                    <div class="price">${course.price === 0 ? 'Free' : '$' + course.price}</div>
                    <img class="arrow" src="/images/right-arrow.png" alt="Arrow Icon" />
                </div>
            </div>
        `;
        coursesContainer.insertAdjacentHTML('beforeend', courseHTML);
    });

    // Оновлюємо кнопку "Load More"
    const loadMoreButton = document.querySelector(".more-btn");
    if (loadMoreButton) {
        loadMoreButton.style.display = currentCourses.length > displayedCourses ? "block" : "none";
    }
}

  // Оновлення кількості результатів
  function updateResultsCount() {
      const resultsCount = document.querySelector(".Result");
      if (resultsCount) {
          resultsCount.textContent = `Результати (${currentCourses.length})`;
      }
  }

  
  // Функція пошуку
  async function performSearch(query) {
      try {
          const searchButton = document.querySelector(".search-btnn");
          searchButton.disabled = true;

          if (query.trim() === '') {
              currentCourses = [...coursesData];
          } else {
              const response = await fetch(`/api/search/search?query=${encodeURIComponent(query)}`);
              if (!response.ok) throw new Error('Помилка пошуку');
              currentCourses = await response.json();
          }

          filterCourses(); // Застосовуємо фільтри після пошуку
          searchButton.disabled = false;
      } catch (error) {
          console.error('Помилка пошуку:', error);
          searchButton.disabled = false;
      }
  }

  // Event Listeners
  const searchInput = document.querySelector(".Search");
  const searchButton = document.querySelector(".search-btnn");

  // Обробники подій для пошуку
  searchButton.addEventListener('click', () => {
      performSearch(searchInput.value);
      filterCourses();
  });

  searchInput.addEventListener('keypress', (e) => {
      if (e.key === 'Enter') {
          performSearch(searchInput.value);
          filterCourses();
      }
  });

  // Обробник для очищення фільтрів
  document.querySelector('.filters-clear').addEventListener('click', function() {
      document.querySelectorAll('.filters input[type="checkbox"]').forEach(checkbox => {
          checkbox.checked = false;
      });
      currentCourses = [...coursesData];
      displayedCourses = 6;
      renderCourses();
      updateResultsCount();
  });

  // Обробник для застосування фільтрів
  document.querySelector('.filters-apply').addEventListener('click', filterCourses);

  // Обробник для сортування
  document.querySelector(".dropdown").addEventListener("change", function(e) {
      const sortValue = e.target.value;
      
      switch(sortValue) {
          case "option1": // Сортування за ціною
              currentCourses.sort((a, b) => a.price - b.price);
              break;
          case "option2": // Сортування за популярністю
              currentCourses.sort((a, b) => b.popularity - a.popularity);
              break;
          default:
              // За замовчуванням не сортуємо
              break;
      }
      
      renderCourses();
  });

  // Обробник для кнопки "Завантажити ще"
  document.querySelector(".more-btn").addEventListener("click", function() {
      displayedCourses += 6;
      renderCourses();
  });

  // Початкова ініціалізація
  renderCourses();
  updateResultsCount();
});