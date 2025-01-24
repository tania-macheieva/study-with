// header-management.js

// Translations for all headers
const headerTranslations = {
    en: {
        headerAll: "All Courses",
        headerAbout: "About",
        headerContact: "Contact",
        headerFAQ: "FAQ",
        headerSearch: "Search...",
        headerSignUp: "Sign Up",
        headerSignIn: "Sign In",
        headerUser: "username",
        headerCreate: "Create course",
        dropdownProfile: "Profile",
        dropdownLogout: "Logout"
    },
    ua: {
        headerAll: "Всi курси",
        headerAbout: "Про нас",
        headerContact: "Контакти",
        headerFAQ: "Поширенi питання",
        headerSearch: "Пошук...",
        headerSignUp: "Зареєструватися",
        headerSignIn: "Увійти",
        headerUser: "Ім'я користувача",
        headerCreate: "Створити курс",
        dropdownProfile: "Профіль",
        dropdownLogout: "Вийти"
    }
};

// Language management
function initializeLanguage() {
    const currentLang = localStorage.getItem('language') || 'en';
    document.documentElement.lang = currentLang;
    
    const langSwitcher = document.querySelector('.lang-switcher');
    if (langSwitcher) {
        // Set active state for current language
        const buttons = langSwitcher.querySelectorAll('.lang-btn');
        buttons.forEach(btn => {
            btn.classList.toggle('active', btn.getAttribute('data-lang') === currentLang);
        });

        // Add click event listener
        langSwitcher.addEventListener('click', (event) => {
            if (event.target.classList.contains('lang-btn')) {
                event.preventDefault();
                const selectedLang = event.target.getAttribute('data-lang');
                
                if (selectedLang !== currentLang) {
                    localStorage.setItem('language', selectedLang);
                    location.reload();
                }
            }
        });
    }

    // Apply translations
    applyTranslations(currentLang);
}

// Apply translations to the page
function applyTranslations(lang) {
    const translations = headerTranslations[lang];
    if (!translations) return;

    document.querySelectorAll('[data-lang]').forEach(element => {
        const key = element.getAttribute('data-lang');
        if (translations[key]) {
            if (element.tagName === 'INPUT') {
                element.setAttribute('placeholder', translations[key]);
            } else {
                element.textContent = translations[key];
            }
        }
    });
}

// Authentication management
function getAuthDataFromURL() {
    const urlParams = new URLSearchParams(window.location.search);
    const token = urlParams.get('token');
    const userId = urlParams.get('userId');
    const role = urlParams.get('role');
    const name = urlParams.get('name');

    if (token && userId && role) {
        return { token, userId, role, name };
    }
    return null;
}

function getAuthDataFromStorage() {
    const token = localStorage.getItem('token');
    const userId = localStorage.getItem('userId');
    const role = localStorage.getItem('role');
    const name = localStorage.getItem('name');

    if (token && userId && role) {
        return { token, userId, role, name };
    }
    return null;
}

function saveAuthData(authData) {
    localStorage.setItem('token', authData.token);
    localStorage.setItem('userId', authData.userId);
    localStorage.setItem('role', authData.role);
    localStorage.setItem('name', authData.name || '');
}

function clearAuthData() {
    localStorage.removeItem('token');
    localStorage.removeItem('userId');
    localStorage.removeItem('role');
    localStorage.removeItem('name');
}

async function initializeHeader() {
    let authData = getAuthDataFromURL() || getAuthDataFromStorage();
    const isCourseView = window.location.pathname.includes('course-view');
    
    let headerPath;
    if (!authData) {
        headerPath = '/header/header-noauth.html';
    } else if (isCourseView) {
        headerPath = '/header/course-header.html';
    } else {
        headerPath = authData.role === 'teacher' 
            ? '/header/header-teacher.html' 
            : '/header/header-student.html';
    }

    try {
        const response = await fetch(headerPath);
        const headerHtml = await response.text();
        document.body.insertAdjacentHTML('afterbegin', headerHtml);
        
        initializeLanguage();
        
        if (authData) {
            if (authData.name) {
                const usernameElement = document.querySelector('#user span');
                if (usernameElement) {
                    usernameElement.textContent = authData.name;
                }
            }
            if (!isCourseView) {
                initializeUserDropdown(authData);
            }
        }
    } catch (error) {
        console.error('Error loading header:', error);
    }
}

// Initialize user dropdown menu
function initializeUserDropdown(authData) {
    if (!authData) return;

    const userButton = document.querySelector('#user');
    if (!userButton) return;

    userButton.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();

        const existingDropdown = document.querySelector('.user-dropdown');
        if (existingDropdown) {
            existingDropdown.remove();
            return;
        }

        const dropdown = createUserDropdown(authData);
        document.body.appendChild(dropdown);

        // Close dropdown when clicking outside
        document.addEventListener('click', function closeDropdown(e) {
            if (!dropdown.contains(e.target) && !userButton.contains(e.target)) {
                dropdown.remove();
                document.removeEventListener('click', closeDropdown);
            }
        });
    });
}

// Оновлена функція створення дропдауну
function createUserDropdown(authData) {
    const dropdown = document.createElement('div');
    dropdown.className = 'user-dropdown';
    
    // Отримуємо поточну мову
    const currentLang = localStorage.getItem('language') || 'en';
    const translations = headerTranslations[currentLang];
    
    dropdown.innerHTML = `
        <a href="${authData.role === 'teacher' ? '/profile-teacher' : '/profile-student'}" class="dropdown-item">
            <i class="fas fa-user"></i>
            <span data-lang="dropdownProfile">${translations.dropdownProfile}</span>
        </a>
        <a href="#" class="dropdown-item" id="logout">
            <i class="fas fa-sign-out-alt"></i>
            <span data-lang="dropdownLogout">${translations.dropdownLogout}</span>
        </a>
    `;

    // Додаємо стилі для дропдауну
    const styles = document.createElement('style');
    styles.textContent = `
        .user-dropdown {
            position: absolute;
            top: 100%;
            right: 0;
            background: white;
            border-radius: 8px;
            box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
            padding: 8px 0;
            min-width: 150px;
            z-index: 1000;
            margin-top: 5px;
        }

        .user-dropdown::before {
            content: '';
            position: absolute;
            top: -6px;
            right: 20px;
            width: 12px;
            height: 12px;
            background: white;
            transform: rotate(45deg);
            border-left: 1px solid rgba(0, 0, 0, 0.1);
            border-top: 1px solid rgba(0, 0, 0, 0.1);
        }

        .user-dropdown .dropdown-item {
            display: flex;
            align-items: center;
            padding: 8px 16px;
            color: #333;
            text-decoration: none;
            font-size: 14px;
            transition: background-color 0.2s;
        }

        .user-dropdown .dropdown-item:hover {
            background-color: #f5f5f5;
        }

        .user-dropdown .dropdown-item i {
            margin-right: 8px;
            width: 16px;
            color: #666;
        }

        @keyframes dropdownFade {
            from {
                opacity: 0;
                transform: translateY(-10px);
            }
            to {
                opacity: 1;
                transform: translateY(0);
            }
        }

        .user-dropdown {
            animation: dropdownFade 0.2s ease forwards;
        }
        
        #user {
            position: relative;
            display: flex;
            align-items: center;
            cursor: pointer;
        }
        
        #user:hover {
            opacity: 0.8;
        }
    `;

    document.head.appendChild(styles);
    
    // Обробник для кнопки виходу
    dropdown.querySelector('#logout').addEventListener('click', (e) => {
        e.preventDefault();
        clearAuthData();
        window.location.href = '/';
    });

    return dropdown;
}

// Оновлена функція ініціалізації дропдауну
function initializeUserDropdown(authData) {
    if (!authData) return;

    const userButton = document.querySelector('#user');
    if (!userButton) return;

    const userContainer = document.createElement('div');
    userContainer.style.position = 'relative';
    userButton.parentNode.insertBefore(userContainer, userButton);
    userContainer.appendChild(userButton);

    userButton.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();

        const existingDropdown = document.querySelector('.user-dropdown');
        if (existingDropdown) {
            existingDropdown.remove();
            return;
        }

        const dropdown = createUserDropdown(authData);
        userContainer.appendChild(dropdown);

        // Закриваємо дропдаун при кліку поза ним
        document.addEventListener('click', function closeDropdown(e) {
            if (!dropdown.contains(e.target) && !userButton.contains(e.target)) {
                dropdown.remove();
                document.removeEventListener('click', closeDropdown);
            }
        });
    });
}

// Оновлена функція застосування перекладів
function applyTranslations(lang) {
    const translations = headerTranslations[lang];
    if (!translations) return;

    document.querySelectorAll('[data-lang]').forEach(element => {
        const key = element.getAttribute('data-lang');
        if (translations[key]) {
            if (element.tagName === 'INPUT') {
                element.setAttribute('placeholder', translations[key]);
            } else {
                element.textContent = translations[key];
            }
        }
    });

    // Оновлюємо дропдаун, якщо він відкритий
    const existingDropdown = document.querySelector('.user-dropdown');
    if (existingDropdown) {
        const authData = getAuthDataFromStorage();
        if (authData) {
            existingDropdown.remove();
            const userContainer = document.querySelector('#user').parentElement;
            userContainer.appendChild(createUserDropdown(authData));
        }
    }
}

// Initialize everything when DOM is loaded
document.addEventListener('DOMContentLoaded', initializeHeader);