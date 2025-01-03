document.addEventListener("DOMContentLoaded", function() {
    const searchInput = document.querySelector(".Search");
    const suggestionsContainer = document.querySelector(".search-suggestions");
    
    // Функція для показу підказок
    function showSuggestions(query) {
        if (query.length < 2) {
            suggestionsContainer.style.display = 'none';
            return;
        }

        // Фільтруємо курси для підказок
        const suggestions = coursesData.filter(course => 
            course.name.toLowerCase().includes(query.toLowerCase()) ||
            course.description.toLowerCase().includes(query.toLowerCase())
        ).slice(0, 5); // Показуємо максимум 5 підказок

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
    searchInput.addEventListener('input', (e) => {
        showSuggestions(e.target.value);
    });

    // Обробник кліку по підказці
    suggestionsContainer.addEventListener('click', (e) => {
        const suggestionItem = e.target.closest('.search-suggestion-item');
        if (suggestionItem) {
            const courseName = suggestionItem.dataset.courseName;
            searchInput.value = courseName;
            suggestionsContainer.style.display = 'none';
            // Виконуємо пошук
            performSearch(courseName);
        }
    });

    // Закриваємо підказки при кліку поза ними
    document.addEventListener('click', (e) => {
        if (!e.target.closest('.search-container')) {
            suggestionsContainer.style.display = 'none';
        }
    });

    // Обробка клавіатурної навігації
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
                    performSearch(searchInput.value);
                }
                break;
        }
    });
});