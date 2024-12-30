// Функція для отримання даних користувача з URL після Google авторизації
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

// Функція для отримання даних користувача з локального сховища
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

// Функція для збереження даних автентифікації
function saveAuthData(authData) {
    localStorage.setItem('token', authData.token);
    localStorage.setItem('userId', authData.userId);
    localStorage.setItem('role', authData.role);
    localStorage.setItem('name', authData.name || '');
}

// Функція для очищення даних автентифікації
function clearAuthData() {
    localStorage.removeItem('token');
    localStorage.removeItem('userId');
    localStorage.removeItem('role');
    localStorage.removeItem('name');
}

// Функція для завантаження відповідного хедера
async function loadHeader() {
    // Спочатку перевіряємо URL на наявність даних автентифікації (після Google auth)
    let authData = getAuthDataFromURL();
    
    // Якщо немає даних в URL, перевіряємо локальне сховище
    if (!authData) {
        authData = getAuthDataFromStorage();
    } else {
        // Якщо дані є в URL, зберігаємо їх
        saveAuthData(authData);
        // Очищаємо URL
        window.history.replaceState({}, document.title, window.location.pathname);
    }

    // Визначаємо, який хедер завантажувати
    let headerPath = '/header/header-login.html';
    
    if (authData) {
        if (authData.role === 'teacher') {
            headerPath = '/header/header-teacher.html';
        } else if (authData.role === 'student') {
            headerPath = '/header/header-student.html';
        }
    }

    try {
        const response = await fetch(headerPath);
        const headerHtml = await response.text();
        
        // Вставляємо хедер в початок body
        document.body.insertAdjacentHTML('afterbegin', headerHtml);

        // Якщо користувач авторизований, оновлюємо ім'я користувача
        if (authData && authData.name) {
            const usernameElement = document.querySelector('#user span');
            if (usernameElement) {
                usernameElement.textContent = authData.name;
            }
        }

        // Додаємо обробник для кнопки виходу
        const userButton = document.querySelector('#user');
        if (userButton) {
            userButton.addEventListener('click', (e) => {
                e.preventDefault();
                e.stopPropagation();

                // Видаляємо існуючий дропдаун, якщо він вже відкритий
                const existingDropdown = document.querySelector('.user-dropdown');
                if (existingDropdown) {
                    existingDropdown.remove();
                    return;
                }

                // Створюємо новий дропдаун
                const dropdown = document.createElement('div');
                dropdown.className = 'user-dropdown';

                const profileLink = authData.role === 'teacher' ? '/profile-teacher' : '/profile-student';
                dropdown.innerHTML = `
                    <a href="${profileLink}" class="dropdown-item">
                        <i class="fas fa-user"></i>
                        Profile
                    </a>
                    <div class="dropdown-divider"></div>
                    <a href="#" class="dropdown-item" id="logout">
                        <i class="fas fa-sign-out-alt"></i>
                        Logout
                    </a>
                `;

                // Позиціонуємо дропдаун в правому верхньому куті
                dropdown.style.position = 'fixed';
                dropdown.style.top = '60px';  // Відступ зверху
                dropdown.style.right = '10px'; // Відступ праворуч

                document.body.appendChild(dropdown);

                // Обробник для виходу
                dropdown.querySelector('#logout').addEventListener('click', (e) => {
                    e.preventDefault();
                    clearAuthData();
                    window.location.href = '/';
                });

                // Закриваємо дропдаун при кліку поза ним
                document.addEventListener('click', function closeDropdown(e) {
                    if (!dropdown.contains(e.target) && !userButton.contains(e.target)) {
                        dropdown.remove();
                        document.removeEventListener('click', closeDropdown);
                    }
                });
            });
        }

    } catch (error) {
        console.error('Error loading header:', error);
    }
}

// Запускаємо завантаження хедера при завантаженні сторінки
document.addEventListener('DOMContentLoaded', loadHeader);

// Додаємо стилі для дропдауна
const dropdownStyles = document.createElement('style');
dropdownStyles.textContent = `
    .user-dropdown {
        background: white;
        border-radius: 8px;
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
        padding: 8px 0;
        z-index: 1000;
        min-width: 180px;
        font-family: 'Jost', sans-serif;
        position: fixed; /* Закріплене положення */
        top: 20px; /* Відступ зверху */
        right: 20px; /* Відступ праворуч */
        max-width: 200px; /* Максимальна ширина */
    }

    .user-dropdown .dropdown-item {
        display: flex;
        align-items: center;
        padding: 8px 16px;
        color: #333;
        text-decoration: none;
        font-size: 14px;
    }

    .user-dropdown .dropdown-item:hover {
        background-color: #f8f9fa;
    }

    .user-dropdown .dropdown-item i {
        margin-right: 10px;
        width: 16px;
        color: #666;
    }

    .dropdown-divider {
        height: 1px;
        background-color: #e9ecef;
        margin: 4px 0;
    }


    /* Анімація появи дропдауну */
    .user-dropdown {
        opacity: 0;
        transform: translateY(-10px);
        animation: dropdownFade 0.2s ease forwards;
    }

    @keyframes dropdownFade {
        to {
            opacity: 1;
            transform: translateY(0);
        }
    }

    /* Стилі для кнопки користувача */
    #user {
        cursor: pointer;
        position: relative;
    }

    #user:hover {
        opacity: 0.8;
    }
`;

document.head.appendChild(dropdownStyles);