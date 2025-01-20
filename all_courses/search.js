document.addEventListener("DOMContentLoaded", function() {
    const searchInput = document.querySelector(".Search");
    const suggestionsContainer = document.querySelector(".search-suggestions");

    
    const USE_DATABASE = true; // Синхронізуємо з all.js
    
    // Функція для отримання курсів для підказок
    async function getSuggestions(query) {
        if (USE_DATABASE) {
            try {
                const response = await fetch(`/api/search/suggestions?query=${encodeURIComponent(query)}`);
                if (!response.ok) throw new Error('Failed to fetch suggestions');
                return await response.json();
            } catch (error) {
                console.error('Error fetching suggestions:', error);
                // Fallback до локальних даних
                return coursesData ? coursesData.filter(course => 
                    course.name.toLowerCase().includes(query.toLowerCase()) ||
                    course.description.toLowerCase().includes(query.toLowerCase())
                ).slice(0, 5) : [];
            }
        } else {
            // Використовуємо локальні дані
            return coursesData.filter(course => 
                course.name.toLowerCase().includes(query.toLowerCase()) ||
                course.description.toLowerCase().includes(query.toLowerCase())
            ).slice(0, 5);
        }
    }

    // Функція для показу підказок
    async function showSuggestions(query) {
        if (query.length < 2) {
            suggestionsContainer.style.display = 'none';
            return;
        }

        const suggestions = await getSuggestions(query);

        if (suggestions.length > 0) {
            suggestionsContainer.innerHTML = suggestions.map(course => `
                <div class="search-suggestion-item" data-course-name="${course.name}">
                    <div class="suggestion-name">${highlightMatch(course.name, query)}</div>
                    <div class="suggestion-description">${course.description}</div>
                </div>
            `).join('');
            suggestionsContainer.style.display = 'block';
        } else {
            suggestionsContainer.style.display = 'none';
        }
    }

    // Функція для підсвічування збігів
    function highlightMatch(text, query) {
        const regex = new RegExp(`(${query})`, 'gi');
        return text.replace(regex, '<strong>$1</strong>');
    }

    // Обробник введення в поле пошуку
    let debounceTimeout;
    searchInput.addEventListener('input', (e) => {
        clearTimeout(debounceTimeout);
        debounceTimeout = setTimeout(() => {
            showSuggestions(e.target.value);
        }, 300); // Додаємо затримку для оптимізації запитів
    });

    // Обробник кліку по підказці
    suggestionsContainer.addEventListener('click', (e) => {
        const suggestionItem = e.target.closest('.search-suggestion-item');
        if (suggestionItem) {
            const courseName = suggestionItem.dataset.courseName;
            searchInput.value = courseName;
            suggestionsContainer.style.display = 'none';
            if (typeof performSearch === 'function') {
                performSearch(courseName);
            }
        }
    });

    // Інші обробники залишаються без змін...
    document.addEventListener('click', (e) => {
        if (!e.target.closest('.search-container')) {
            suggestionsContainer.style.display = 'none';
        }
    });

    searchInput.addEventListener('keydown', (e) => {
        const suggestions = suggestionsContainer.querySelectorAll('.search-suggestion-item');
        const currentIndex = Array.from(suggestions).findIndex(item => item.classList.contains('selected'));

        switch(e.key) {
            case 'ArrowDown':
                e.preventDefault();
                if (currentIndex < suggestions.length - 1) {
                    if (currentIndex >= 0) suggestions[currentIndex].classList.remove('selected');
                    suggestions[currentIndex + 1].classList.add('selected');
                }
                break;
            case 'ArrowUp':
                e.preventDefault();
                if (currentIndex > 0) {
                    suggestions[currentIndex].classList.remove('selected');
                    suggestions[currentIndex - 1].classList.add('selected');
                }
                break;
            case 'Enter':
                const selectedItem = suggestionsContainer.querySelector('.selected');
                if (selectedItem) {
                    searchInput.value = selectedItem.dataset.courseName;
                    suggestionsContainer.style.display = 'none';
                    if (typeof performSearch === 'function') {
                        performSearch(searchInput.value);
                    }
                }
                break;
        }
    });
});