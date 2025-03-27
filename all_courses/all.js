document.addEventListener("DOMContentLoaded", async function() {
    let displayedCourses = 6;
    let currentCourses = [];
    
    // Parse URL parameters right at the beginning
    const urlParams = new URLSearchParams(window.location.search);
    const categoryParam = urlParams.get('category');
  
    async function loadInitialCourses() {
      try {
        const response = await fetch('/api/courses');
        if (!response.ok) throw new Error('Failed to fetch courses');
        currentCourses = await response.json();
        
        // Apply category filter if it exists in URL parameters
        if (categoryParam) {
          // Map the category name from URL to the corresponding theme option
          const categoryMappings = {
            'programming': '1',
            'design': '2',
            'marketing': '3',
            'business': '4',
            'languages': '5',
            'finance': '6',
            'development': '7',
            'art': '8',
            'photography': '9', 
            'psychology': '10',  
            'health': '11',    
            'cooking': '12', 
            'science': '13', 
            'game-development': '14', 
            'childcare': '15'   
          };
          
          const themeOptionNumber = categoryMappings[categoryParam];
          if (themeOptionNumber) {
            const checkbox = document.querySelector(`input[name="theme-option-${themeOptionNumber}"]`);
            if (checkbox) {
              checkbox.checked = true;
              // Filter courses based on the selected category
              filterCourses();
              // Exit the function early as we've already rendered the courses
              return;
            }
          }
        }
        
        // If no category filter was applied, render all courses
        renderCourses();
        updateResultsCount();
      } catch (error) {
        console.error('Error loading courses:', error);
        const coursesContainer = document.querySelector(".courses");
        coursesContainer.innerHTML = '<p>Помилка завантаження курсів. Спробуйте пізніше.</p>';
      }
    }
  
    function filterCourses() {
        // Your existing filterCourses function
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
            const courseElement = document.createElement('div');
            courseElement.className = 'course_group';
            courseElement.style.cursor = 'pointer';
            
            // Define character limit for the description (matching first script)
            const descriptionCharLimit = 250;
            const shortDescription = course.description.split(' ').slice(0, 10).join(' ');
            
            // Create truncated description for the tooltip that respects character limit
            const tooltipDescription = course.description.length > descriptionCharLimit 
              ? course.description.substring(0, descriptionCharLimit) + "..." 
              : course.description;
            
            courseElement.innerHTML = `
            <div class="course_name">${course.name}</div>
            <div class="description-container">
                <div class="description">${shortDescription}...</div>
                <div class="tooltip">${tooltipDescription}</div> 
            </div>
            <div class="course-image">
                <img src="/uploads/${course.image_url || 'images/250x100.png'}" 
                     alt="${course.name}" 
                     onerror="this.src='images/250x100.png'" />
            </div>
            <div class="group-27">
                <div class="price">${course.price === 0 ? 'Free' : `$${course.price}`}</div>
            </div>
            `;
            
            courseElement.addEventListener('click', () => {
                window.location.href = `/course/${course.id}`;
            });
            
            coursesContainer.appendChild(courseElement);
        });
    
        // Add tooltip event listeners after all courses are appended to DOM
        document.querySelectorAll('.description-container').forEach(container => {
            const description = container.querySelector('.description');
            const tooltip = container.querySelector('.tooltip');
            
            // Position the container correctly
            container.style.position = "relative";
            
            description.addEventListener('mouseenter', () => {
                tooltip.style.display = 'block';
                
                // Position the tooltip directly below the description
                tooltip.style.position = 'absolute';
                tooltip.style.left = '0';
                tooltip.style.top = '100%'; // Position directly below the description
                tooltip.style.zIndex = '1000';
            });
            
            description.addEventListener('mouseleave', () => {
                tooltip.style.display = 'none';
            });
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
  
    
    updateResultsCount();
    
    await loadInitialCourses();
});