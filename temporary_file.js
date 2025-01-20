// Тимчасовий файл для зберігання коду

document.addEventListener("DOMContentLoaded", async function() {
    let displayedCourses = 6;
    let currentCourses = [];
  
    async function loadInitialCourses() {
      try {
        const response = await fetch('/api/courses');
        if (!response.ok) throw new Error('Failed to fetch courses');
        currentCourses = await response.json();
        renderCourses();
        updateResultsCount();
      } catch (error) {
        console.error('Error loading courses:', error);
        const coursesContainer = document.querySelector(".courses");
        coursesContainer.innerHTML = '<p>Помилка завантаження курсів. Спробуйте пізніше.</p>';
      }
    }
  
    function filterCourses() {
        let filteredCourses = [...currentCourses];
  
        const selectedThemes = Array.from(document.querySelectorAll('input[name^="theme-option-"]:checked'))
            .map(checkbox => checkbox.nextElementSibling.textContent.trim());
  
        if (selectedThemes.length > 0) {
            filteredCourses = filteredCourses.filter(course => 
                course.themes.some(theme => selectedThemes.includes(theme))
            );
        }
  
        const selectedPrices = Array.from(document.querySelectorAll('input[name^="price-"]:checked'))
            .map(checkbox => checkbox.name);
  
        if (selectedPrices.length > 0) {
            filteredCourses = filteredCourses.filter(course => {
                if (selectedPrices.includes('price-free') && course.price === 0) return true;
                if (selectedPrices.includes('price-paid') && course.price > 0) return true;
                return false;
            });
        }
  
        const selectedLevels = Array.from(document.querySelectorAll('input[name^="level-"]:checked'))
            .map(checkbox => checkbox.name);
  
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
  
      const loadMoreButton = document.querySelector(".more-btn");
      if (loadMoreButton) {
          loadMoreButton.style.display = currentCourses.length > displayedCourses ? "block" : "none";
      }
    }
  
    function getTranslation(key) {
        const translations = {
            ua: {
                results: "Результати ",
            },
            en: {
                results: "Results "
            },
        };
  
        const language = localStorage.getItem('language'); 
        return translations[language] && translations[language][key] ? translations[language][key] : 'Translation not found';
    }
  
    function updateResultsCount() {
        const resultsCount = document.querySelector(".Result");
        if (resultsCount) {
            const courseCount = currentCourses && Array.isArray(currentCourses) ? currentCourses.length : 0;
            resultsCount.textContent = `${getTranslation('results')} (${courseCount})`;
        }
    }
  
    async function performSearch(query) {
        try {
            const searchButton = document.querySelector(".search-btnn");
            searchButton.disabled = true;
  
            if (query.trim() === '') {
                await loadInitialCourses();
            } else {
                const response = await fetch(`/api/search/search?query=${encodeURIComponent(query)}`);
                if (!response.ok) throw new Error('Помилка пошуку');
                currentCourses = await response.json();
            }
  
            filterCourses();
            searchButton.disabled = false;
        } catch (error) {
            console.error('Помилка пошуку:', error);
            searchButton.disabled = false;
        }
    }
  
    const searchInput = document.querySelector(".Search");
    const searchButton = document.querySelector(".search-btnn");
  
    searchButton.addEventListener('click', () => {
        performSearch(searchInput.value);
    });
  
    searchInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            performSearch(searchInput.value);
        }
    });
  
    document.querySelector('.filters-clear').addEventListener('click', async function() {
        document.querySelectorAll('.filters input[type="checkbox"]').forEach(checkbox => {
            checkbox.checked = false;
        });
        await loadInitialCourses();
    });
  
    document.querySelector('.filters-apply').addEventListener('click', filterCourses);
  
    document.querySelector(".dropdown").addEventListener("change", function(e) {
        const sortValue = e.target.value;
        
        switch(sortValue) {
            case "option1": 
                currentCourses.sort((a, b) => a.price - b.price);
                break;
            case "option2": 
                currentCourses.sort((a, b) => b.popularity - a.popularity);
                break;
            default:
                break;
        }
        
        renderCourses();
    });
  
    document.querySelector(".more-btn").addEventListener("click", function() {
        displayedCourses += 6;
        renderCourses();
    });
  
    await loadInitialCourses();
    updateResultsCount();
  });

//-------------------------------------------


document.addEventListener("DOMContentLoaded", async function() {
    let displayedCourses = 6;
    let currentCourses = [];

    const USE_DATABASE = true; ///---------

    async function loadInitialCourses() {
      try {
        if (USE_DATABASE) {
          const response = await fetch('/api/courses');
          if (!response.ok) throw new Error('Failed to fetch courses');
          currentCourses = await response.json();
        } else {
          currentCourses = [...coursesData];
        }
        renderCourses();
        updateResultsCount();
      } catch (error) {
        console.error('Error loading courses:', error);
        if (USE_DATABASE && typeof coursesData !== 'undefined') {
          console.log('Falling back to local data');
          currentCourses = [...coursesData];
          renderCourses();
          updateResultsCount();
        } else {
          const coursesContainer = document.querySelector(".courses");
          coursesContainer.innerHTML = '<p>Помилка завантаження курсів. Спробуйте пізніше.</p>';
        }
      }
    }
  
    async function performSearch(query) {
      try {
        const searchButton = document.querySelector(".search-btnn");
        searchButton.disabled = true;
  
        if (query.trim() === '') {
          await loadInitialCourses();
        } else {
          if (USE_DATABASE) {
            const response = await fetch(`/api/search/search?query=${encodeURIComponent(query)}`);
            if (!response.ok) throw new Error('Помилка пошуку');
            currentCourses = await response.json();
          } else {
            currentCourses = coursesData.filter(course => 
              course.name.toLowerCase().includes(query.toLowerCase()) ||
              course.description.toLowerCase().includes(query.toLowerCase())
            );
          }
        }
  
        filterCourses();
        searchButton.disabled = false;
      } catch (error) {
        console.error('Помилка пошуку:', error);
        searchButton.disabled = false;
        
        if (USE_DATABASE && typeof coursesData !== 'undefined') {
          currentCourses = coursesData.filter(course => 
            course.name.toLowerCase().includes(query.toLowerCase()) ||
            course.description.toLowerCase().includes(query.toLowerCase())
          );
          filterCourses();
        }
      }
    }
  
    function filterCourses() {
        let filteredCourses = [...currentCourses];
  
        const selectedThemes = Array.from(document.querySelectorAll('input[name^="theme-option-"]:checked'))
            .map(checkbox => checkbox.nextElementSibling.textContent.trim());
  
        if (selectedThemes.length > 0) {
            filteredCourses = filteredCourses.filter(course => 
                course.themes.some(theme => selectedThemes.includes(theme))
            );
        }
  
        const selectedPrices = Array.from(document.querySelectorAll('input[name^="price-"]:checked'))
            .map(checkbox => checkbox.name);
  
        if (selectedPrices.length > 0) {
            filteredCourses = filteredCourses.filter(course => {
                if (selectedPrices.includes('price-free') && course.price === 0) return true;
                if (selectedPrices.includes('price-paid') && course.price > 0) return true;
                return false;
            });
        }
  
        const selectedLevels = Array.from(document.querySelectorAll('input[name^="level-"]:checked'))
            .map(checkbox => checkbox.name);
  
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
  
      const loadMoreButton = document.querySelector(".more-btn");
      if (loadMoreButton) {
          loadMoreButton.style.display = currentCourses.length > displayedCourses ? "block" : "none";
      }
    }
  
    const searchInput = document.querySelector(".Search");
    const searchButton = document.querySelector(".search-btnn");
  
    searchButton?.addEventListener('click', () => {
        performSearch(searchInput.value);
    });
  
    searchInput?.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            performSearch(searchInput.value);
        }
    });
  
    document.querySelector('.filters-clear')?.addEventListener('click', async function() {
        document.querySelectorAll('.filters input[type="checkbox"]').forEach(checkbox => {
            checkbox.checked = false;
        });
        await loadInitialCourses();
    });
  
    document.querySelector('.filters-apply')?.addEventListener('click', filterCourses);
  
    document.querySelector(".dropdown")?.addEventListener("change", function(e) {
        const sortValue = e.target.value;
        
        switch(sortValue) {
            case "option1":
                currentCourses.sort((a, b) => a.price - b.price);
                break;
            case "option2":
                currentCourses.sort((a, b) => b.popularity - a.popularity);
                break;
        }
        
        renderCourses();
    });
  
    document.querySelector(".more-btn")?.addEventListener("click", function() {
        displayedCourses += 6;
        renderCourses();
    });
  
    await loadInitialCourses();
    updateResultsCount();
  });