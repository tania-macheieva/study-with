class HeaderComponent extends HTMLElement {
    constructor() {
        super();
        
        this.innerHTML = `
        <style>
            body {
                margin: 0;
                padding: 0;
                background-color: #fff;
                font-family: 'Inter', sans-serif;
            }

            header {
                background-color: #fff;
                padding: 4px 16px;
                display: flex;
                justify-content: space-between;
                align-items: center;
                position: sticky;
                top: 0;
                z-index: 1000;
                box-shadow: 0px 2px 5px rgba(0, 0, 0, 0.15);
            }

            .container {
                display: flex;
                width: 100%;
                align-items: center;
                justify-content: space-between;
                margin: 0;
                padding: 0;
            }

            .left-s {
                display: flex;
                align-items: center;
                gap: 80px;
            }

            .left-s h2 {
                display: flex;
                align-items: center;
                gap: 8px;
                margin: 0;
                color: #333;
            }

            .home {
                font-size: 18px;
                font-weight: normal;
            }

            .course-n {
                font-size: 18px;
                font-weight: 600;
                margin-left: auto;
            }

            img {
                width: 20px;
                height: 20px;
            }

            .right-s {
                display: flex;
                align-items: center;
                gap: 32px;
            }

            .progress-container {
                text-align: center;
                width: 150px;
                margin-top: 12px;
            }

            .progress-bar {
                position: relative;
                width: 100%;
                height: 10px;
                background-color: #DCECFC;
                border-radius: 5px;
                overflow: hidden;
                margin-bottom: 4px;
            }

            .progress-bar span {
                display: block;
                height: 100%;
                background-color: #283044;
                border-radius: 5px;
            }

            .progress-text {
                display: flex;
                justify-content: space-between;
                font-size: 12px;
                margin: 0;
                color: #333;
            }

            .progress-text span {
                font-size: 12px;
                color: #333;
            }

            .percent {
                font-size: 12px;
                font-weight: 500;
                color: #333;
            }

            .lang-switcher {
                font-size: 16px;
                font-weight: 500;
                color: #333;
            }

            .lang-btn {
                text-decoration: none;
                cursor: pointer;
            }

            .btn {
                background: none;
                border: none;
                cursor: pointer;
                padding: 8px;
            }

            .btn img {
                width: 28px;
                height: 28px;
                border-radius: 50%;
            }

            .oth {
                width: 4px;
                height: 20px;
            }

            .dropdown-menu {
                display: none;
                position: absolute;
                top: calc(100% + 8px);
                right: 0;
                background-color: #fff;
                box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
                border-radius: 12px;
                z-index: 10;
            }

            .dropdown-menu a {
                display: flex;
                align-items: center;
                padding: 10px 15px;
                text-decoration: none;
                color: #333;
                border-bottom: 1px solid #eee;
            }

            .dropdown-menu a:last-child {
                border-bottom: none;
            }

            .dropdown-menu a img {
                width: 16px;
                height: 16px;
                margin-right: 10px;
            }

            .dropdown-menu a:hover {
                background-color: #f0f0f0;
            }

            .right-s>div button {
                background: none;
                border: none;
                cursor: pointer;
            }

            .dropdown.active .dropdown-menu,
            .dropdown-menu.show {
                display: block;
            }
        </style>
         <header>
            <div class="container">
                <div class="left-s">
                    <h2 class="home">
                        <img src="../images/arrow.svg" alt="arrow-exit-ico">Home
                    </h2>
                    <h2 class="course-n">
                        <img src="../images/save-c.svg" alt="save-course-ico">
                    </h2>
                </div>

                <div class="right-s">
                    <div class="progress-container">
                        <div class="progress-bar">
                            <span style="width: 0%;"></span>
                        </div>
                        <div class="progress-text">
                            <span>Progress</span>
                            <span class="percent">0%</span>
                        </div>
                    </div>

                    <div class="lang-switcher">
                        <a class="lang-btn" data-lang="en">EN</a> |
                        <a class="lang-btn" data-lang="ua">UA</a>
                    </div>
                    <button class="btn" id="profile-btn">
                        <img src="../images/user-avatar.png" alt="user image" />
                    </button>
                    <div>
                        <button>
                            <img class="oth" src="../images/more.png" alt="other-options-ico">
                        </button>
                        <div class="dropdown-menu">
                            <a href="#">
                                <img src="../images/share-c.svg" alt="share-ico">
                                Share this course
                            </a>
                            <a href="#">
                                <img src="../images/unenroll.svg" alt="Unenroll">
                                Unenroll from this course
                            </a>
                        </div>
                    </div>
                </div>
            </div>
        </header>
        `;
        
        
        this.initializeProfileButton();
        this.initializeHomeButton();
    }
    initializeHomeButton() {
        const homeButton = this.querySelector('.home');
        if (homeButton) {
            homeButton.addEventListener('click', () => {
                window.location.href = '/';
            });
            homeButton.style.cursor = 'pointer';
        }
    }

    getStyles() {
        return `
            body {
                margin: 0;
                padding: 0;
                background-color: #fff;
                font-family: 'Inter', sans-serif;
            }
            /* Тут всі ваші стилі */
        `;
    }

    initializeProfileButton() {
        const profileButton = this.querySelector('#profile-btn');
        if (profileButton) {
            profileButton.addEventListener('click', () => {
                this.handleProfileClick();
            });
        }
    }

    handleProfileClick() {
        const userId = localStorage.getItem('userId');
        const userRole = localStorage.getItem('role');

        if (!userId) {
            window.location.href = '/login';
            return;
        }

        let profileUrl;
        switch (userRole) {
            case 'student':
                profileUrl = '/profile-student';
                break;
            case 'teacher':
                profileUrl = '/profile-teacher';
                break;
        }

        window.location.href = profileUrl;
    }

    setProgress(progress) {
        const progressBar = this.querySelector('.progress-bar span');
        const progressText = this.querySelector('.progress-text .percent');
        
        if (progressBar && progressText) {
            progressBar.style.width = `${progress}%`;
            progressText.textContent = `${Math.round(progress)}%`;
        }
    }
}

customElements.define('course-header', HeaderComponent);


// Керування мовою
function initializeLanguage() {
    const currentLang = localStorage.getItem('language') || 'en';
    document.documentElement.lang = currentLang;
    
    const langSwitcher = document.querySelector('.lang-switcher');
    if (langSwitcher) {
        // Встановлюємо активний стан для поточної мови
        const buttons = langSwitcher.querySelectorAll('.lang-btn');
        buttons.forEach(btn => {
            btn.classList.toggle('active', btn.getAttribute('data-lang') === currentLang);
        });

        // Додаємо обробник кліку
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

    // Застосовуємо переклади
    applyTranslations(currentLang);
}

// Застосування перекладів до сторінки
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

async function initializeCourseProgress() {
    try {
        const urlParams = new URLSearchParams(window.location.search);
        let courseId = urlParams.get('id');

        if (!courseId) {
            courseId = window.location.pathname.split('/course/').pop();
        }

        const userId = localStorage.getItem('userId');

        if (!courseId || !userId) return;

        // Додаємо завантаження даних курсу
        const courseResponse = await fetch(`/api/courses/${courseId}/full`);
        if (!courseResponse.ok) {
            throw new Error('Помилка завантаження даних курсу');
        }
        const courseData = await courseResponse.json();

        // Додаємо оновлення назви
        const courseNameElement = document.querySelector('.course-n');
        if (courseNameElement) {
            courseNameElement.innerHTML = `
                <img src="../images/save-c.svg" alt="save-course-ico">
                ${courseData.name}
            `;
        }

        // Існуючий код для прогресу
        const response = await fetch(`/api/course/${courseId}/progress?userId=${userId}`);
        if (!response.ok) {
            throw new Error('Помилка завантаження прогресу');
        }
        const progressData = await response.json();
        
        const headerComponent = document.querySelector('course-header');
        if (headerComponent) {
            headerComponent.setProgress(progressData.progress);
        }
    } catch (error) {
        console.error('Помилка ініціалізації курсу:', error);
    }
}

const headerTranslations = {
    en: {
        home: "Home",
        courseName: "Course name",
        progress: "Progress",
        shareCourse: "Share this course",
        unenrollCourse: "Unenroll from this course",
    },
    ua: {
        home: "Головна сторінка",
        courseName: "Назва курсу",
        progress: "Прогрес",
        shareCourse: "Поділитися цим курсом",
        unenrollCourse: "Відписатися від цього курсу",
    },
};

function getUserRole() {
    const token = localStorage.getItem('token');
    if (!token) return null;
    
    try {
        const base64Url = token.split('.')[1];
        const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
        const payload = JSON.parse(atob(base64));
        
        return payload.role;
    } catch (error) {
        console.error('Помилка при отриманні ролі користувача:', error);
        return null;
    }
}

function initializeProfileRedirect() {
    const userLink = document.querySelector('#user');
    if (userLink) {
        userLink.addEventListener('click', (e) => {
            e.preventDefault();
            const role = getUserRole();
            
            if (role === 'teacher') {
                window.location.href = '/profile-teacher';
            } else {
                window.location.href = '/profile-student';
            }
        });
    }
}



document.addEventListener('DOMContentLoaded', initializeCourseProgress);