document.addEventListener("DOMContentLoaded", async function() {
    let displayedCourses = 6;
    let currentCourses = [];
    let allCourses = []; // Store all courses to avoid refetching when clearing filters
    
    // Parse URL parameters right at the beginning
    const urlParams = new URLSearchParams(window.location.search);
    const categoryParam = urlParams.get('category');
  
    async function loadInitialCourses() {
      try {
        const response = await fetch('/api/courses');
        if (!response.ok) throw new Error('Failed to fetch courses');
        allCourses = await response.json();
        currentCourses = [...allCourses]; // Make a copy to preserve the original
        
        // Log the structure of the first course to check properties
        if (currentCourses.length > 0) {
            console.log('Example course structure:', currentCourses[0]);
            // Log all themes that exist in the dataset to debug
            const allThemes = new Set();
            currentCourses.forEach(course => {
                if (course.themes) {
                    if (Array.isArray(course.themes)) {
                        course.themes.forEach(theme => allThemes.add(theme));
                    } else {
                        allThemes.add(course.themes);
                    }
                }
            });
            console.log('All themes in dataset:', [...allThemes]);
        }
        
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
        const language = localStorage.getItem('language') || 'en';
        const errorMessage = language === 'ua' ? 
          'Помилка завантаження курсів. Спробуйте пізніше.' : 
          'Error loading courses. Please try again later.';
        coursesContainer.innerHTML = `<p>${errorMessage}</p>`;
      }
    }
  
    function filterCourses() {
        // Start with all courses when filtering
        let filteredCourses = [...allCourses];
     
        // Get checkbox elements for themes
        const themeCheckboxes = document.querySelectorAll('input[name^="theme-option-"]:checked');
        
        // Create an array of selected theme labels
        const selectedThemes = Array.from(themeCheckboxes).map(checkbox => {
            return checkbox.nextElementSibling.textContent.trim();
        });
    
        console.log('Selected themes:', selectedThemes);
        
        // Get the theme label mappings from translations
        const language = localStorage.getItem('language') || 'en';
        const themeTranslations = getThemeTranslations(language);
        
        // Apply theme filter if any themes are selected
        if (selectedThemes.length > 0) {
            filteredCourses = filteredCourses.filter(course => {
                // Skip courses without themes
                if (!course.themes) return false;
                
                // Convert to array if it's a string
                const courseThemes = Array.isArray(course.themes) ? course.themes : [course.themes];
                
                // Debug
                console.log('Course themes:', courseThemes);
                
                // Check if any of the course themes match any of the selected themes
                for (const courseTheme of courseThemes) {
                    for (const selectedTheme of selectedThemes) {
                        // Check for direct match or translated match
                        if (courseTheme === selectedTheme || 
                            themeTranslations[selectedTheme] === courseTheme ||
                            selectedTheme === themeTranslations[courseTheme]) {
                            return true;
                        }
                    }
                }
                return false;
            });
        }
    
        // Price filtering
        const freeSelected = document.querySelector('input[name="price-free"]').checked;
        const paidSelected = document.querySelector('input[name="price-paid"]').checked;
    
        if (freeSelected || paidSelected) {
            filteredCourses = filteredCourses.filter(course => {
                if (freeSelected && (!course.price || course.price === 0)) return true;
                if (paidSelected && course.price > 0) return true;
                return false;
            });
        }
    
        // Level filtering - extract the actual level value from the checkbox name
        const selectedLevels = Array.from(document.querySelectorAll('input[name^="level-"]:checked'))
            .map(checkbox => {
                // Extract the level value from the checkbox name (e.g., 'level-intermediate' -> 'intermediate')
                return checkbox.name.replace('level-', '');
            });
    
        console.log('Selected levels:', selectedLevels);
    
        if (selectedLevels.length > 0) {
            filteredCourses = filteredCourses.filter(course => {
                // Handle if level is not defined
                if (!course.level) return false;
                
                // Convert level to lowercase for case-insensitive comparison
                const courseLevelLower = course.level.toLowerCase();
                return selectedLevels.some(level => courseLevelLower === level.toLowerCase());
            });
        }
    
        currentCourses = filteredCourses;
        displayedCourses = 6; // Reset to show first 6 courses after filtering
        renderCourses();
        updateResultsCount();
        
        // Debug output
        console.log('Filtered courses count:', filteredCourses.length);
    }
    
    // Function to get theme translations
    function getThemeTranslations(lang) {
        const translations = {
            en: {
                "Programming": "Programming",
                "Design": "Design", 
                "Marketing": "Marketing",
                "Business": "Business",
                "Languages": "Languages",
                "Finance": "Finance",
                "Personal Development": "Personal Development",
                "Art": "Art",
                "Photography": "Photography",
                "Psychology": "Psychology",
                "Health": "Health",
                "Cooking": "Cooking",
                "Science": "Science",
                "Game Development": "Game Development",
                "Childcare": "Childcare"
            },
            ua: {
                "Програмування": "Programming",
                "Дизайн": "Design",
                "Маркетинг": "Marketing",
                "Бiзнес": "Business",
                "Мови": "Languages",
                "Фiнанси": "Finance",
                "Особистiсний розвиток": "Personal Development",
                "Мистецтво": "Art",
                "Фотографія": "Photography",
                "Психологія": "Psychology",
                "Здоров'я": "Health",
                "Кулінарія": "Cooking",
                "Наука": "Science",
                "Розробка ігор": "Game Development",
                "Виховання дітей": "Childcare"
            }
        };
        
        return translations[lang] || translations['en'];
    }
    
    function renderCourses() {
        const coursesToShow = currentCourses.slice(0, displayedCourses);
        const coursesContainer = document.querySelector(".courses");
        coursesContainer.innerHTML = '';
    
        const language = localStorage.getItem('language') || 'en';
        const noCoursesText = language === 'ua' ? 'Курсів не знайдено' : 'No courses found';
        
        if (coursesToShow.length === 0) {
            coursesContainer.innerHTML = `<p>${noCoursesText}</p>`;
            return;
        }
    
        coursesContainer.style.display = 'grid';
        coursesContainer.style.gridTemplateColumns = 'repeat(3, 1fr)';
        coursesContainer.style.gap = '40px';
    
        coursesToShow.forEach(course => {
            const courseElement = document.createElement('div');
            courseElement.className = 'course_group';
            courseElement.style.cursor = 'pointer';
            
            // Define character limit for the description
            const descriptionCharLimit = 250;
            const shortDescription = course.description ? 
                course.description.split(' ').slice(0, 10).join(' ') : 
                '';
            
            // Create truncated description for the tooltip that respects character limit
            const tooltipDescription = course.description && course.description.length > descriptionCharLimit 
              ? course.description.substring(0, descriptionCharLimit) + "..." 
              : (course.description || '');
            
            // Determine price display text based on language
            const freeText = language === 'ua' ? 'Безкоштовно' : 'Free';
            const priceDisplay = (!course.price || course.price === 0) ? 
                freeText : 
                `$${course.price}`;
            
            courseElement.innerHTML = `
            <div class="course_name">${course.name || ''}</div>
            <div class="description-container">
                <div class="description">${shortDescription}${shortDescription ? '...' : ''}</div>
                <div class="tooltip">${tooltipDescription}</div> 
            </div>
            <div class="course-image">
                <img src="/uploads/${course.image_url || 'images/250x100.png'}" 
                     alt="${course.name || ''}" 
                     onerror="this.src='images/250x100.png'" />
            </div>
            <div class="group-27">
                <div class="price">${priceDisplay}</div>
            </div>
            `;
            
            courseElement.addEventListener('click', () => {
                window.location.href = `/course-preview?id=${course.id}`;
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
  
        const language = localStorage.getItem('language') || 'en'; 
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
                currentCourses = [...allCourses]; // Reset to all courses if search is empty
            } else {
                const response = await fetch(`/api/search/search?query=${encodeURIComponent(query)}`);
                if (!response.ok) throw new Error('Search error');
                currentCourses = await response.json();
            }
  
            displayedCourses = 6; // Reset pagination
            renderCourses();
            updateResultsCount();
            searchButton.disabled = false;
        } catch (error) {
            console.error('Search error:', error);
            searchButton.disabled = false;
            
            // Reset to all courses if search fails
            currentCourses = [...allCourses];
            renderCourses();
            updateResultsCount();
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
  
    document.querySelector('.filters-clear').addEventListener('click', function() {
        document.querySelectorAll('.filters input[type="checkbox"]').forEach(checkbox => {
            checkbox.checked = false;
        });
        
        // Reset to all courses
        currentCourses = [...allCourses];
        displayedCourses = 6;
        renderCourses();
        updateResultsCount();
    });
  
    document.querySelector('.filters-apply').addEventListener('click', filterCourses);
  
    document.querySelector(".dropdown").addEventListener("change", function(e) {
        const sortValue = e.target.value;
        
        switch(sortValue) {
            case "option1": 
                currentCourses.sort((a, b) => (a.price || 0) - (b.price || 0));
                break;
            case "option2": 
                currentCourses.sort((a, b) => (b.popularity || 0) - (a.popularity || 0));
                break;
            default:
                // Reset to default order
                currentCourses = [...allCourses];
                // Then apply any active filters
                filterCourses();
                return; // Exit early as filterCourses will render
        }
        
        renderCourses();
    });
  
    document.querySelector(".more-btn").addEventListener("click", function() {
        displayedCourses += 6;
        renderCourses();
    });
    
    // Add a debugging function to check the structure of courses
    function debugThemes() {
        console.log('=== DEBUG THEMES ===');
        const themeCheckboxes = document.querySelectorAll('input[name^="theme-option-"]');
        
        themeCheckboxes.forEach(checkbox => {
            console.log(`Checkbox ${checkbox.name}: ${checkbox.nextElementSibling.textContent}`);
        });
        
        console.log('=== COURSE THEMES ===');
        allCourses.forEach((course, index) => {
            if (index < 5) { // Only log first 5 courses to avoid console flood
                console.log(`Course ${course.id || index}: ${course.name}, Themes:`, course.themes);
            }
        });
    }
    
    // Call debug after courses load
    setTimeout(debugThemes, 2000);
  
    // Initialize
    updateResultsCount();
    await loadInitialCourses();
});