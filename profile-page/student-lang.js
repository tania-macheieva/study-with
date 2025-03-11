const translations = {
    en: {
        pageTitle: 'Study With | Profile',
        // username: 'Username',
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
        messages: 'Notifications',
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
        noMessages: 'You have no new notifications yet.',
        manageAccount: 'Manage Account Visibility',
        privatePublic: 'You can make your account private or public using the buttons below.',
        closeAccount: 'Close Account',
        openAccount: 'Open Account',
        noCourses: 'You haven\'t enrolled in any courses yet.',
        btnShowLess: 'Show less',
        noLinkedCourses: "You have no saved courses yet",
        contentNotFound: "Content not found.",
        noReplies: "There are no notifications.",
        responseTo: "Response to: ",
        goToCourse: "Go to the course",
    },
    ua: {
        pageTitle: 'Study With | Профіль',
        // username: 'Ім`я користувача',
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
        messages: 'Сповіщення',
        noMessages: 'У вас ще немає нових сповіщень.',
        manageAccount: 'Управління видимістю акаунту',
        privatePublic: 'Ви можете зробити свій акаунт приватним або публічним за допомогою кнопок нижче.',
        closeAccount: 'Закрити акаунт',
        openAccount: 'Відкрити акаунт',
        noCourses: 'Ви ще не записались на жодний курс.',
        btnShowLess: 'Показати менше',
        noLinkedCourses: 'У вас ще немає збережених курсів',
        contentNotFound: "Вміст не знайдено.",
        noReplies: "Сповіщень немає.",
        responseTo: "Відповідь на: ",
        goToCourse: "Перейти до курсу",

    }
};


// Загальні стилі для всіх списків
document.head.appendChild(document.createElement('style')).textContent = `
    /* Base styles for lists */
    .courses-list,
    .certificates-list,
    .bookmarks-list {
        max-height: 400px; /* Висота для 3 елементів */
        overflow: hidden;
        transition: max-height 0.3s ease-in-out;
    }

    /* Expanded state */
    .courses-list.expanded,
    .certificates-list.expanded,
    .bookmarks-list.expanded {
        max-height: 2000px; /* Місце для всіх елементів */
    }

    /* View all buttons default state */
    .btn-view-all-1,
    .btn-view-all-3,
    .btn-view-all-4 {
        display: none; /* Приховані за замовчуванням */
    }
`;

// Функція для керування кнопкою "Показати більше/менше"
function manageViewAllButton(containerClass, itemsCount) {
    const viewAllBtn = document.querySelector(`.${containerClass}`);
    if (viewAllBtn) {
        // Показуємо кнопку тільки якщо елементів більше 3
        viewAllBtn.style.display = itemsCount > 3 ? 'block' : 'none';
        
        // Set initial button text
        const lang = localStorage.getItem('language') || 'en';
        viewAllBtn.textContent = translations[lang].btnViewAll;
    }
}

// Функція для ініціалізації всіх кнопок
function initializeViewAllButtons() {
    const buttonConfigs = [
        { buttonClass: '.btn-view-all-1', containerClass: '.my-courses', listClass: '.courses-list' },
        { buttonClass: '.btn-view-all-3', containerClass: '.my-certificates', listClass: '.certificates-list' },
        { buttonClass: '.btn-view-all-4', containerClass: '.my-bookmarks', listClass: '.bookmarks-list' }
    ];

    buttonConfigs.forEach(config => {
        document.querySelectorAll(config.buttonClass).forEach(button => {
            // Set initial button text
            const lang = localStorage.getItem('language') || 'en';
            button.textContent = translations[lang].btnViewAll;
            
            button.addEventListener('click', function() {
                const section = button.closest(config.containerClass);
                const list = section.querySelector(config.listClass);
                
                if (list) {
                    list.classList.toggle('expanded');
                    const isExpanded = list.classList.contains('expanded');
                    const lang = localStorage.getItem('language') || 'en';
                    button.textContent = isExpanded ? 
                        translations[lang].btnShowLess : 
                        translations[lang].btnViewAll;
                }
            });
        });
    });
}

// Функція для перевірки кількості елементів у списках
function checkItemsCount() {
    // Для курсів
    const coursesList = document.querySelector('.courses-list');
    if (coursesList) {
        const courses = coursesList.querySelectorAll('.course');
        manageViewAllButton('btn-view-all-1', courses.length);
    }

    // Для сертифікатів
    const certificatesList = document.querySelector('.certificates-list');
    if (certificatesList) {
        const certificates = certificatesList.querySelectorAll('.certificate');
        manageViewAllButton('btn-view-all-3', certificates.length);
    }

    // Для закладок
    const bookmarksList = document.querySelector('.bookmarks-list');
    if (bookmarksList) {
        const bookmarks = bookmarksList.querySelectorAll('.bookmark');
        manageViewAllButton('btn-view-all-4', bookmarks.length);
    }
}

// Ініціалізація при завантаженні сторінки
document.addEventListener('DOMContentLoaded', () => {
    initializeViewAllButtons();
    checkItemsCount();
}); 

// Основна функція для завантаження курсів
async function loadEnrolledCourses() {
    try {
        const userId = localStorage.getItem('userId');
        if (!userId) {
            console.log('User ID not found');
            return;
        }

        const response = await fetch(`/courses/enrolled/${userId}`);
        if (!response.ok) throw new Error('Failed to fetch enrolled courses');
        
        const courses = await response.json();
        const coursesContainer = document.getElementById('enrolled-courses');
        
        if (!coursesContainer) return;

        if (!courses || courses.length === 0) {
            coursesContainer.innerHTML = `<p class="no-courses">${translations[localStorage.getItem('language') || 'en'].noCourses}</p>`;
            manageViewAllButton('btn-view-all-1', 0);
            return;
        }

        coursesContainer.innerHTML = courses.map(course => `
            <div class="course">
                <p class="p-1">${course.name || 'Без назви'}</p>
                <div class="progress-bar">
                    <span style="width: ${course.progress || 0}%;"></span>
                </div>
                <p class="percent">${course.progress || 0}%</p>
                <img src="/uploads/${course.image_url || '/images/250x100.png'}" 
                     alt="${course.name}" 
                     onerror="this.src='/images/250x100.png'">
                <button class="btn-resume" data-course-id="${course.id}">
                    ${translations[localStorage.getItem('language') || 'en'].btnResume}
                </button>
            </div>
        `).join('');

        document.querySelectorAll('.btn-resume').forEach(button => {
            button.addEventListener('click', function() {
                const courseId = this.getAttribute('data-course-id');
                if (courseId) {
                    window.location.href = `/course/${courseId}`;
                }
            });
        });

        manageViewAllButton('btn-view-all-1', courses.length);
        initializeViewAllButtons(); // Reinitialize button listeners after content load

    } catch (error) {
        console.error('Error loading enrolled courses:', error);
        const coursesContainer = document.getElementById('enrolled-courses');
        if (coursesContainer) {
            coursesContainer.innerHTML = '<p class="error-message">Failed to load courses. Please try again later.</p>';
        }
        manageViewAllButton('btn-view-all-1', 0);
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

        const response = await fetch(`http://localhost:8000/courses/bookmarks/${userId}`);
        if (!response.ok) throw new Error('Помилка завантаження збережених курсів');
        
        let courses = await response.json();
        //Відфільтровуємо лише ті курси, які `is_saved = TRUE`
        courses = courses.filter(course => course.is_saved);
        const bookmarksList = document.querySelector('.bookmarks-list');
        
        if (!bookmarksList) return;

        if (courses.length === 0) {
            bookmarksList.innerHTML = `<p class="no-courses">${translations[localStorage.getItem('language') || 'en'].noLinkedCourses}</p>`;
            manageViewAllButton('btn-view-all-4', 0);
            return;
        }

        bookmarksList.innerHTML = courses.map(course => `
            <div class="bookmark">
                <p class="p-1">${course.name}</p>
                <img src="/uploads/${course.image_url || '/images/250x100.png'}" alt="${course.name}">
                <button class="btn-open" onclick="window.location.href='/course/preview?id=${course.id}'">
                    ${translations[localStorage.getItem('language') || 'en'].btnOpen}
                </button>
                <button class="remove-bookmark" data-course-id="${course.id}">Remove</button>
            </div>
        `).join('');

        // Додаємо обробник подій для кожної кнопки "Remove"
        document.querySelectorAll('.remove-bookmark').forEach(button => {
            button.addEventListener('click', async function () {
                const courseId = this.dataset.courseId;
                await toggleBookmark(courseId); 
            });
        });

        manageViewAllButton('btn-view-all-4', courses.length);
        initializeViewAllButtons();


    } catch (error) {
        console.error('Помилка завантаження збережених курсів:', error);
        const bookmarksList = document.querySelector('.bookmarks-list');
        if (bookmarksList) {
            bookmarksList.innerHTML = '<p class="error-message">Помилка завантаження збережених курсів</p>';
        }
        manageViewAllButton('btn-view-all-4', 0);
    }

}
// Функція для перемикання стану закладки (Додати / Видалити)
async function toggleBookmark(courseId) {
    const userId = localStorage.getItem('userId');

    if (!userId) {
        console.log('Користувач не авторизований');
        return;
    }

    try {
        const response = await fetch('http://localhost:8000/api/courses/bookmarks', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ userId, courseId })
        });

        if (!response.ok) throw new Error('Помилка зміни стану закладки');

        console.log('Закладка оновлена успішно');
        loadSavedBookmarks(); // Оновлюємо список закладок після видалення

    } catch (error) {
        console.error('Помилка видалення закладки:', error);
        alert('Помилка видалення закладки'); 
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
            <div id="messages-container">
                <!-- Replies will be dynamically inserted here -->
            </div>
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
    
    loadEnrolledCourses();
    loadSavedBookmarks();
    
    const userLang = localStorage.getItem('language') || 'en';
    applyLanguage(userLang);

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

async function loadStudentData() {
    try {
        const userId = localStorage.getItem('userId');
        const response = await fetch(`http://localhost:8000/auth/profile/student/${userId}`);
        
        if (!response.ok) {
            throw new Error('Failed to load profile data');
        }

        const data = await response.json();
        
        // Заповнюємо поля форми отриманими даними
        document.querySelector('input[placeholder="Enter your real name"]').value = data.name || '';
        document.querySelector('input[placeholder="Enter your nickname"]').value = data.nickname || '';
        document.querySelector('input[placeholder="Enter your date of birth"]').value = data.date_of_birth ? data.date_of_birth.split('T')[0] : '';
        document.querySelector('input[placeholder="Enter your phone number"]').value = data.phone_number || '';
        document.querySelector('input[placeholder="Write some information about yourself"]').value = data.additional_info || '';

    } catch (error) {
        console.error('Error loading profile:', error);
        alert('Failed to load profile data');
    }
    }
    
// Відкриття модального вікна
tabLinks.forEach(tab => {
    tab.addEventListener('click', () => {
        const tabName = tab.getAttribute('data-tab');
        modalContentContainer.innerHTML = tabContents[tabName] || "<p>Content not found.</p>";
        modal.style.display = "flex";
        
        if (tabName === 'messages') {
            loadUserReplies();
        }

        applyLanguage(localStorage.getItem('language') || 'en');
    });
});
function getCurrentLanguage() {
    return localStorage.getItem('language') || 'en'; // Якщо мова не збережена, за замовчуванням англійська
}
async function loadUserReplies() {
    try {
        const userId = localStorage.getItem('userId');
        if (!userId) {
            console.warn('User ID не знайдено в localStorage');
            return;
        }

        const response = await fetch(`/api/comments/replies/${userId}`);
        if (!response.ok) throw new Error('Не вдалося завантажити відповіді');

        const replies = await response.json();
        const messagesContainer = document.getElementById('messages-container');

        if (!messagesContainer) return;
        messagesContainer.innerHTML = '';

        const lang = getCurrentLanguage(); // Отримуємо поточну мову

        if (!replies || replies.length === 0) {
            messagesContainer.innerHTML = `<p class="no-replies">${translations[lang].noReplies}</p>`;
            return;
        }

        replies.forEach(reply => {
            const maxWords = 50;

            // Функція для обрізання тексту
            function truncateText(text) {
                const words = text.split(' ');
                return words.length > maxWords ? words.slice(0, maxWords).join(' ') + '...' : text;
            }

            // Обрізаємо коментар користувача
            const truncatedReply = truncateText(reply.content);

            // Обрізаємо батьківський коментар
            const truncatedParent = truncateText(reply.parent_comment_content);
            const userImage = reply.teacher_profile_image?.trim() 
            ? `<img src="${reply.teacher_profile_image}" alt="${reply.user_name}" class="user-avatar">`
            : reply.student_profile_image?.trim()
            ? `<img src="${reply.student_profile_image}" alt="${reply.user_name}" class="user-avatar">`
            : reply.profile_image?.trim()
            ? `<img src="${reply.profile_image}" alt="${reply.user_name}" class="user-avatar">`
            : `<div class="default-avatar">${reply.user_name[0]}</div>`;
        
            // Формуємо URL з якірним посиланням на коментар
            const commentLink = `/course/${reply.course_id}#comment-${reply.comment_id}`;

            // Додаємо маленьку картинку курсу
            const courseThumbnail = reply.course_thumbnail 
                ? `<img src="/uploads/${reply.course_thumbnail}" alt="${reply.course_name}" class="course-thumbnail">`
                : '';

            const messageItem = document.createElement('div');
            messageItem.classList.add('message-item');
            messageItem.innerHTML = `
                <div class="message-header">
                    ${userImage}
                    <div>
                        <strong class="user-name">${reply.user_name}</strong>
                        <p class="comment-time">${new Date(reply.created_at).toLocaleString()}</p>
                    </div>
                    <div class="course-info">
                        ${courseThumbnail}
                        <p class="course-name">${reply.course_name}</p>
                    </div>  
                </div>
                
                <p class="comment-content">${truncatedReply}</p>
                
                <div class="reply-to-container">
                    <p class="reply-to">${translations[lang].responseTo} <em>“${truncatedParent}”</em></p>
                </div>

                <button onclick="location.href='${commentLink}'" class="go-to-comment">${translations[lang].goToCourse}</button>
            `;

            messagesContainer.appendChild(messageItem);
        });

    } catch (error) {
        console.error('Помилка завантаження відповідей:', error);
        const messagesContainer = document.getElementById('messages-container');
        if (messagesContainer) {
            messagesContainer.innerHTML = `<p class="error-message">${translations[getCurrentLanguage()].contentNotFound}</p>`;
        }
    }
}



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

document.body.addEventListener('click', async (event) => {
// Обробка форми профілю
if (event.target.tagName === 'BUTTON' && event.target.textContent === 'Save changes') {
    const name = document.querySelector('input[placeholder="Enter your real name"]').value;
    const nickname = document.querySelector('input[placeholder="Enter your nickname"]').value;
    const dateOfBirth = document.querySelector('input[placeholder="Enter your date of birth"]').value;
    const phoneNumber = document.querySelector('input[placeholder="Enter your phone number"]').value;
    const additionalInfo = document.querySelector('input[placeholder="Write some information about yourself"]').value;

    const userId = localStorage.getItem('userId');

    try {
        const response = await fetch('http://localhost:8000/auth/update-student-profile', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                userId,
                name,
                nickname,
                dateOfBirth,
                phoneNumber,
                additionalInfo
            })
        });

        const result = await response.json();

        if (result.success) {
            alert('Profile updated successfully!');
            const usernameElement = document.getElementById('username');
            if (usernameElement) {
                usernameElement.textContent = nickname || name;
            }
            
            // Оновлюємо дані в localStorage
            localStorage.setItem('name', name);
            localStorage.setItem('nickname', nickname);
            
            // Закриваємо модальне вікно
            modal.style.display = "none";
        } else {
            alert('Failed to update profile');
        }
    } catch (error) {
        console.error('Error updating profile:', error);
        alert('Error updating profile');
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

async function updateProgress() {
    try {
        const courseId = window.location.pathname.split('/course/').pop();
        const userId = localStorage.getItem('userId');
        
        const response = await fetch(`/api/course/${courseId}/progress?userId=${userId}`);
        if (!response.ok) throw new Error('Failed to fetch progress');
        
        const progressData = await response.json();
        console.log('Progress data:', progressData); // Для дебагу
        
        // Оновлюємо прогрес-бар в хедері
        const progressBar = document.querySelector('.progress-bar span');
        const progressText = document.querySelector('.progress-text .percent');
        
        if (progressBar && progressText) {
            const progress = progressData.progress || 0;
            progressBar.style.width = `${progress}%`;
            progressText.textContent = `${Math.round(progress)}%`;
        }

        // Оновлюємо прогрес в модулях
        document.querySelectorAll('.module-progress').forEach(moduleProgress => {
            const total = progressData.totalLectures;
            const completed = progressData.completedLectures;
            moduleProgress.innerHTML = `
                <span>${completed}/${total} complete</span>
                <span class="separator">|</span>
                <span>${total - completed} left</span>
            `;
        });

    } catch (error) {
        console.error('Error updating progress:', error);
    }
}

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
