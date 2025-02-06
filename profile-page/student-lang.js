const translations = {
    en: {
        pageTitle: 'Study With | Profile',
        username: 'Username',
        btnTeacher: 'Become a teacher',
        myCourses: 'My courses',
        courseName: 'Course name',
        courseProgress: 'Progress',
        btnResume: 'Resume',
        btnViewAll1: 'View all',
        myCertificates: 'My certificates',
        certificateName: 'Certificate name',
        completedOn: 'Completed on dd/mm/yyyy',
        btnDownload: 'Download',
        myBookmarks: 'My bookmarks',
        bookmarkName: 'Bookmark name',
        btnOpen: 'Open',
        btnViewAll: 'View all',
        publicProf: 'Public profile',
        profile: 'Profile',
        security: 'Security',
        messages: 'Messages',
        closeAccount: 'Closing an account',
        infPublicProf: 'This is your public profile. You can see how it looks to other users.',
        editProf: 'Editing your profile',
        name: 'Name:',
        entername:'Enter your real name',
        nickname: 'Nickname:',
        enterNickname: 'Enter your nickname',
        dob: 'Date of birth:',
        enterDOB: 'Enter your date of birth',
        phone: 'Phone:',
        enterPhone: 'Enter your phone number',
        description: 'Description:',
        writeDescription: 'Write some information about yourself',
        saveChanges: 'Save changes',
        securitySettings: 'Security settings',
        currentPassword: 'Current Password:',
        enterCurrentPassword: 'Enter current password',
        newPassword: 'New Password:',
        enterNewPassword: 'Enter new password',
        confirmNewPassword: 'Confirm New Password:',
        confirmEnterNewPassword:'Confirm new password',
        updatePassword: 'Update password',
        noMessages: 'You have no new messages yet.',
        manageAccount: 'Manage Account Visibility',
        privatePublic: 'You can make your account private or public using the buttons below.',
        closeAccount: 'Close Account',
        openAccount: 'Open Account',
        noCourses: 'You haven\'t enrolled in any courses yet.'
    },
    ua: {
        pageTitle: 'Study With | Профіль',
        username: 'Ім`я користувача',
        btnTeacher: 'Стати вчителем',
        myCourses: 'Мої курси',
        courseName: 'Назва курсу',
        courseProgress: 'Прогрес',
        btnResume: 'Продовжити',
        btnViewAll1: 'Показати все',
        myCertificates: 'Мої сертифікати',
        certificateName: 'Назва сертифікату',
        completedOn: 'Завершено dd/mm/yyyy',
        btnDownload: 'Завантажити',
        myBookmarks: 'Мої закладки',
        bookmarkName: 'Назва закладки',
        btnOpen: 'Відкрити',
        btnViewAll: 'Показати все',
        publicProf: 'Публічний профіль',
        profile: 'Профіль',
        security: 'Безпека',
        messages: 'Повідомлення',
        closeAccount: 'Закриття акаунту',
        infPublicProf: 'Це ваш публічний профіль. Ви можете побачити, як це виглядає для інших користувачів.',
        editProf: 'Редагування профілю',
        name: 'Ім`я:',
        entername:'Введіть своє справжнє ім`я',
        nickname: 'Нік:',
        enterNickname: 'Введіть ваш нік',
        dob: 'Дата народження:',
        enterDOB: 'Введіть вашу дату народження',
        phone: 'Телефон:',
        enterPhone: 'Введіть ваш номер телефону',
        description: 'Опис:',
        writeDescription: 'Напишіть трохи інформації про себе',
        saveChanges: 'Зберегти зміни',
        securitySettings: 'Налаштування безпеки',
        currentPassword: 'Поточний пароль:',
        enterCurrentPassword: 'Введіть поточний пароль',
        newPassword: 'Новий пароль:',
        enterNewPassword: 'Введіть новий пароль',
        confirmNewPassword: 'Підтвердження нового паролю:',
        confirmEnterNewPassword:'Підтвердіть новий пароль',
        updatePassword: 'Оновити пароль',
        noMessages: 'У вас ще немає нових повідомлень.',
        manageAccount: 'Управління видимістю акаунту',
        privatePublic: 'Ви можете зробити свій акаунт приватним або публічним за допомогою кнопок нижче.',
        closeAccount: 'Закрити акаунт',
        openAccount: 'Відкрити акаунт',
        noCourses: 'Ви ще не записались на жодний курс.'
    }
};

// Основна функція для завантаження курсів
async function loadEnrolledCourses() {
    try {
        const userId = localStorage.getItem('userId');
        console.log('1. UserId з localStorage:', userId);

        if (!userId) {
            console.log('2. UserId не знайдено');
            document.getElementById('enrolled-courses').innerHTML = 
                '<p class="no-courses">Будь ласка, увійдіть в систему для перегляду курсів</p>';
            return;
        }

        const url = `http://localhost:8000/courses/enrolled/${userId}`;
        console.log('3. Виконуємо запит до URL:', url);

        const response = await fetch(url);
        console.log('4. Отримано відповідь:', response);

        if (!response.ok) {
            throw new Error(`HTTP помилка! статус: ${response.status}`);
        }

        const courses = await response.json();
        console.log('5. Отримані дані курсів:', courses);

        const coursesContainer = document.getElementById('enrolled-courses');
        
        if (!courses || courses.length === 0) {
            coursesContainer.innerHTML = `<p class="no-courses">${translations[localStorage.getItem('language') || 'en'].noCourses}</p>`;
            return;
        }

        coursesContainer.innerHTML = courses.map(course => `
            <div class="course">
                <p class="p-1">${course.name || 'Без назви'}</p>
                <div class="progress-bar">
                    <span style="width: ${course.progress || 0}%;"></span>
                </div>
                <p class="percent">${course.progress || 0}%</p>
                <img src="${course.image_url || '/images/250x100.png'}" 
                     alt="${course.name}" 
                     onerror="this.src='/images/250x100.png'">
                <button class="btn-resume" onclick="window.location.href='/course/learn/${course.id}'">
                    ${translations[localStorage.getItem('language') || 'en'].btnResume}
                </button>
            </div>
        `).join('');

        document.querySelectorAll('.btn-resume').forEach(button => {
            button.addEventListener('click', function() {
                const courseId = this.getAttribute('data-course-id');
                window.location.href = `/course/${courseId}`;
            });
        });

        // Оновлюємо переклади
        applyLanguage(localStorage.getItem('language') || 'en');

    } catch (error) {
        console.error('Помилка завантаження курсів:', error);
        const errorDetails = error.stack || error.message;
        console.log('Деталі помилки:', errorDetails);
        
        document.getElementById('enrolled-courses').innerHTML = 
            `<p class="error-message">Помилка завантаження курсів: ${error.message}</p>`;
    }
}

// Функція для завантаження закладок
async function loadSavedBookmarks() {
    try {
        const userId = localStorage.getItem('userId');
        if (!userId) {
            console.log('Користувач не авторизований');
            return;
        }

        const response = await fetch(`http://localhost:8000/courses/saved/${userId}`);
        if (!response.ok) throw new Error('Помилка завантаження збережених курсів');
        
        const courses = await response.json();
        const bookmarksList = document.querySelector('.bookmarks-list');
        
        if (!bookmarksList) return;

        if (courses.length === 0) {
            bookmarksList.innerHTML = `<p class="no-courses">У вас ще немає збережених курсів</p>`;
            return;
        }

        bookmarksList.innerHTML = courses.map(course => `
            <div class="bookmark">
                <p class="p-1">${course.name}</p>
                <img src="${course.image_url || '/images/250x100.png'}" alt="${course.name}">
                <button class="btn-open" onclick="window.location.href='/course/preview?id=${course.id}'">
                    ${translations[localStorage.getItem('language') || 'en'].btnOpen}
                </button>
            </div>
        `).join('');

    } catch (error) {
        console.error('Помилка завантаження збережених курсів:', error);
        const bookmarksList = document.querySelector('.bookmarks-list');
        if (bookmarksList) {
            bookmarksList.innerHTML = '<p class="error-message">Помилка завантаження збережених курсів</p>';
        }
    }
}

// Функція для застосування перекладів
function applyLanguage(lang) {
    const langData = translations[lang];
    if (!langData) return;

    document.querySelectorAll('[data-lang]').forEach(element => {
        const langKey = element.getAttribute('data-lang');
        if (langData[langKey]) {
            if (element.tagName === 'INPUT') {
                element.setAttribute('placeholder', langData[langKey]);
            } else if (element.tagName === 'BUTTON') {
                element.textContent = langData[langKey];
            } else if (element.tagName === 'A') {
                element.textContent = langData[langKey];
            } else if (element.tagName === 'SPAN') {
                element.textContent = langData[langKey];
            } else {
                element.innerHTML = langData[langKey];
            }
        }
    });
}

// Обробка модального вікна і вкладок
const tabContents = {
    "public-profile": `
        <h2 data-lang="publicProf">Public profile</h2>
        <p data-lang="infPublicProf">This is your public profile. You can see how it looks to other users.</p>
    `,
    "profile": `
        <h2 data-lang="editProf">Editing your profile</h2>
        <div class="input-group">
            <label data-lang="name">Name:</label>
            <input data-lang="enterName" type="text" placeholder="Enter your real name">
        </div>
        <div class="input-group">
            <label data-lang="nickname">Nickname:</label>
            <input data-lang="enterNickname" type="text" placeholder="Enter your nickname">
        </div>
        <div class="input-group">
            <label data-lang="dob">Date of birth:</label>
            <input data-lang="enterDOB" type="date" placeholder="Enter your date of birth">
        </div>
        <div class="input-group">
            <label data-lang="phone">Phone:</label>
            <input data-lang="enterPhone" type="text" placeholder="Enter your phone number">
        </div>
        <div class="input-group">
            <label data-lang="description">Description:</label>
            <input data-lang="writeDescription" type="text" placeholder="Write some information about yourself">
        </div>
        <button data-lang="saveChanges">Save changes</button>
    `,
    "security": `
        <h2 data-lang="securitySettings">Security settings</h2>
        <div class="input-group">
            <label data-lang="currentPassword">Current Password:</label>
            <div class="password-container">
                <input data-lang="enterCurrentPassword" id="current-password" type="password" placeholder="Enter current password">
                <span class="toggle-password" data-target="current-password">
                    <i class="fas fa-eye"></i>
                </span>
            </div>
        </div>
        <div class="input-group">
            <label data-lang="newPassword">New Password:</label>
            <div class="password-container">
                <input data-lang="enterNewPassword" id="new-password" type="password" placeholder="Enter new password">
                <span class="toggle-password" data-target="new-password">
                    <i class="fas fa-eye"></i>
                </span>
            </div>
        </div>
        <div class="input-group">
            <label data-lang="confirmNewPassword">Confirm New Password:</label>
            <div class="password-container">
                <input data-lang="confirmEnterNewPassword" id="confirm-new-password" type="password" placeholder="Confirm new password">
                <span class="toggle-password" data-target="confirm-new-password">
                    <i class="fas fa-eye"></i>
                </span>
            </div>
        </div>
        <button data-lang="updatePassword">Update password</button>
    `,
    "messages": `
        <h2 data-lang="messages">Messages</h2>
        <p data-lang="noMessages">You have no new messages yet.</p>
    `,
    "close-account": `
        <h2 data-lang="manageAccount">Manage Account Visibility</h2>
        <p data-lang="privatePublic">You can make your account private or public using the buttons below.</p>
        <button data-lang="closeAccount" id="close-account-btn" style="background-color: #f44336; color: white; margin-bottom: 10px;">Close Account</button>
        <button data-lang="openAccount" id="open-account-btn" style="background-color: #4CAF50; color: white;">Open Account</button>
    `
};

// Єдиний слухач DOMContentLoaded
document.addEventListener('DOMContentLoaded', () => {
    console.log('Сторінка завантажена, починаємо ініціалізацію...');
    
    // Завантажуємо курси та закладки
    loadEnrolledCourses();
    loadSavedBookmarks();
    
    // Застосовуємо переклади
    const userLang = localStorage.getItem('language') || 'en';
    applyLanguage(userLang);

    // Ініціалізація вкладок
    initializeTabs();

// Обробники для кнопок "View all"
document.querySelectorAll('.btn-view-all-1').forEach(button => {
    button.addEventListener('click', function() {
        const section = button.closest('.container-my');
        const list = section.querySelector('.courses-list');
        
        if (list) {
            if (list.classList.contains('expanded')) {
                list.classList.remove('expanded');
                button.textContent = translations[localStorage.getItem('language') || 'en'].btnViewAll;
            } else {
                list.classList.add('expanded');
                button.textContent = translations[localStorage.getItem('language') || 'en'].btnViewAll;
            }
        }
    });
});

// Обробник мовного перемикача
document.getElementById('lang-switcher')?.addEventListener('change', (e) => {
    const selectedLang = e.target.value;
    localStorage.setItem('language', selectedLang);
    applyLanguage(selectedLang);
});
});

// Функція ініціалізації вкладок
function initializeTabs() {
const tabLinks = document.querySelectorAll('.tab-link');
const modal = document.getElementById('modal');
const modalContentContainer = document.getElementById('modal-content-container');
const closeButton = document.querySelector('.close-button');

// Відкриття модального вікна
tabLinks.forEach(tab => {
    tab.addEventListener('click', () => {
        const tabName = tab.getAttribute('data-tab');
        modalContentContainer.innerHTML = tabContents[tabName] || "<p>Content not found.</p>";
        modal.style.display = "flex";
        applyLanguage(localStorage.getItem('language') || 'en');
    });
});

// Закриття модального вікна
if (closeButton) {
    closeButton.addEventListener('click', () => {
        modal.style.display = "none";
    });
}

// Закриття по кліку поза модальним вікном
window.addEventListener('click', (event) => {
    if (event.target === modal) {
        modal.style.display = "none";
    }
});
}

// Обробники подій для форм
document.body.addEventListener('click', async (event) => {
// Обробка форми профілю
if (event.target.tagName === 'BUTTON' && event.target.textContent === 'Save changes') {
    const name = document.querySelector('input[placeholder="Enter your real name"]').value;
    const nickname = document.querySelector('input[placeholder="Enter your nickname"]').value;
    const dateOfBirth = document.querySelector('input[placeholder="Enter your date of birth"]').value;
    const phone = document.querySelector('input[placeholder="Enter your phone number"]').value;
    const description = document.querySelector('input[placeholder="Write some information about yourself"]').value;

    const userId = localStorage.getItem('userId');

    try {
        const response = await fetch(`http://localhost:8000/auth/profile/${userId}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                name,
                nickname,
                date_of_birth: dateOfBirth,
                phone_number: phone,
                description,
            }),
        });

        const result = await response.json();

        if (response.ok) {
            alert('Profile updated successfully!');
            const usernameElement = document.getElementById('username');
            if (usernameElement) {
                usernameElement.textContent = nickname;
            }
        } else {
            alert(`Error: ${result.error}`);
        }
    } catch (err) {
        console.error('Error:', err);
        alert('An error occurred while updating the profile.');
    }
}

// Обробка зміни пароля
if (event.target.tagName === 'BUTTON' && event.target.textContent === 'Update password') {
    const currentPassword = document.querySelector('input[placeholder="Enter current password"]').value;
    const newPassword = document.querySelector('input[placeholder="Enter new password"]').value;
    const confirmPassword = document.querySelector('input[placeholder="Confirm new password"]').value;

    const userId = localStorage.getItem('userId');
    const token = localStorage.getItem('token');

    if (!currentPassword || !newPassword || !confirmPassword) {
        alert('Please fill out all fields.');
        return;
    }

    if (newPassword !== confirmPassword) {
        alert('New password and confirmation do not match.');
        return;
    }

    if (newPassword.length < 6) {
        alert('New password must be at least 6 characters long.');
        return;
    }

    try {
        const response = await fetch('http://localhost:8000/auth/update-password', {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`,
            },
            body: JSON.stringify({
                userId,
                currentPassword,
                newPassword,
            }),
        });

        const result = await response.json();

        if (response.ok) {
            alert('Password updated successfully!');
        } else {
            alert(`Error: ${result.error}`);
        }
    } catch (error) {
        console.error('Error:', error);
        alert('An error occurred while updating the password.');
    }
}
});

// Обробка перемикання видимості паролю
document.addEventListener('click', (event) => {
if (event.target.closest('.toggle-password')) {
    const toggle = event.target.closest('.toggle-password');
    const inputId = toggle.getAttribute('data-target');
    const input = document.getElementById(inputId);

    if (input) {
        if (input.type === 'password') {
            input.type = 'text';
            toggle.innerHTML = '<i class="fas fa-eye-slash"></i>';
        } else {
            input.type = 'password';
            toggle.innerHTML = '<i class="fas fa-eye"></i>';
        }
    }
}
});

// Функції для роботи з акаунтом
async function handleAccountAction(action, userId) {
try {
    const response = await fetch(`http://localhost:8000/auth/${action}-account`, {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ userId }),
    });

    const result = await response.json();

    if (response.ok) {
        alert(result.message);
    } else {
        alert(`Error: ${result.error}`);
    }
} catch (error) {
    console.error('Error:', error);
    alert(`An error occurred while ${action}ing the account.`);
}
}

// Обробники для закриття/відкриття акаунту
document.body.addEventListener('click', async (event) => {
const userId = localStorage.getItem('userId');

if (event.target.id === 'close-account-btn') {
    if (confirm('Are you sure you want to close your account?')) {
        await handleAccountAction('close', userId);
    }
}

if (event.target.id === 'open-account-btn') {
    if (confirm('Are you sure you want to open your account?')) {
        await handleAccountAction('open', userId);
    }
}
});
