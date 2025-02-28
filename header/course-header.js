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


function initializeLanguage() {
    const currentLang = localStorage.getItem('language') || 'en';
    document.documentElement.lang = currentLang;
    
    const langSwitcher = document.querySelector('.lang-switcher');
    if (langSwitcher) {
        const buttons = langSwitcher.querySelectorAll('.lang-btn');
        buttons.forEach(btn => {
            btn.classList.toggle('active', btn.getAttribute('data-lang') === currentLang);
        });

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

    applyTranslations(currentLang);
}

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

        const courseResponse = await fetch(`/api/courses/${courseId}/full`);
        if (!courseResponse.ok) {
            throw new Error('Помилка завантаження даних курсу');
        }
        const courseData = await courseResponse.json();

        const courseNameElement = document.querySelector('.course-n');
        if (courseNameElement) {
            courseNameElement.innerHTML = `
                <img src="../images/save-c.svg" alt="save-course-ico">
                ${courseData.name}
            `;
        }

        updateHeaderWithCertificateButton();

        const response = await fetch(`/api/course/${courseId}/progress?userId=${userId}`);
        if (!response.ok) {
            throw new Error('Помилка завантаження прогресу');
        }
        const progressData = await response.json();
        
        const headerComponent = document.querySelector('course-header');
        if (headerComponent) {
            headerComponent.setProgress(progressData.progress);
        }
        
        updateCertificateButtonVisibility(progressData.progress);
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
        getCertificate: "Get Certificate"
    },
    ua: {
        home: "Головна сторінка",
        courseName: "Назва курсу",
        progress: "Прогрес",
        shareCourse: "Поділитися цим курсом",
        unenrollCourse: "Відписатися від цього курсу",
        getCertificate: "Отримати сертифікат"       
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

function updateHeaderWithCertificateButton() {
    const rightSection = document.querySelector('.right-s');
    
    if (!document.querySelector('.certificate-btn') && rightSection) {
        const certificateButton = document.createElement('button');
        certificateButton.className = 'certificate-btn';
        certificateButton.innerHTML = `
            <span data-lang="getCertificate">Отримати сертифікат</span>
        `;
        
        Object.assign(certificateButton.style, {
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '8px 12px',
            background: '#283044',
            color: 'white',
            borderRadius: '8px',
            border: 'none',
            cursor: 'pointer',
            fontFamily: 'Inter, sans-serif',
            fontSize: '14px',
            fontWeight: '500',
            transition: 'background-color 0.3s',
            marginRight: '15px',
            display: 'none'
        });
        
        certificateButton.addEventListener('mouseover', () => {
            certificateButton.style.backgroundColor = '#3a4562';
        });
        
        certificateButton.addEventListener('mouseout', () => {
            certificateButton.style.backgroundColor = '#283044';
        });
        
        certificateButton.addEventListener('click', generateAndDownloadCertificate);
        
        const progressContainer = rightSection.querySelector('.progress-container');
        rightSection.insertBefore(certificateButton, progressContainer);
    }
}

function updateCertificateButtonVisibility(progress) {
    const certificateButton = document.querySelector('.certificate-btn');
    if (certificateButton) {
        certificateButton.style.display = progress >= 100 ? 'flex' : 'none';
    }
}

HeaderComponent.prototype.setProgress = function(progress) {
    const progressBar = this.querySelector('.progress-bar span');
    const progressText = this.querySelector('.progress-text .percent');
    
    if (progressBar && progressText) {
        progressBar.style.width = `${progress}%`;
        progressText.textContent = `${Math.round(progress)}%`;
        
        updateCertificateButtonVisibility(progress);
    }
};

async function generateAndDownloadCertificate() {
    try {
        const urlParams = new URLSearchParams(window.location.search);
        let courseId = urlParams.get('id');
        
        if (!courseId) {
            courseId = window.location.pathname.split('/course/').pop();
        }
        
        const userId = localStorage.getItem('userId');
                
        if (!userId || !courseId) {
            alert('Помилка: неможливо отримати дані користувача або курсу');
            return;
        }

        const userResponse = await fetch(`/api/user/${userId}`);
        if (!userResponse.ok) {
            throw new Error('Помилка отримання даних користувача');
        }
        const userData = await userResponse.json();
        const userName = userData.name || 'Student';
        
        const courseResponse = await fetch(`/api/courses/${courseId}/full`);
        if (!courseResponse.ok) {
            throw new Error('Помилка завантаження даних курсу');
        }
        const courseData = await courseResponse.json();
        
        const certificateHTML = createCertificateTemplate(userName, courseData.name);
        
        const pdfBlob = await convertHTMLToPDF(certificateHTML);
        
        const blobUrl = URL.createObjectURL(pdfBlob);
        
        const downloadLink = document.createElement('a');
        downloadLink.href = blobUrl;
        downloadLink.download = `Certificate_${courseData.name.replace(/\s+/g, '_')}.pdf`;
        
        document.body.appendChild(downloadLink);
        downloadLink.click();
        document.body.removeChild(downloadLink);
        
        setTimeout(() => URL.revokeObjectURL(blobUrl), 100);
        
        await fetch('/api/certificate/issue', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                userId,
                courseId,
                issuedAt: new Date().toISOString()
            })
        });
        
    } catch (error) {
        console.error('Помилка генерації сертифікату:', error);
        alert('Помилка при створенні сертифікату. Спробуйте пізніше.');
    }
}

function createCertificateTemplate(userName, courseName) {
    const currentDate = new Date();
    const formattedDate = `${currentDate.getDate().toString().padStart(2, '0')}.${(currentDate.getMonth() + 1).toString().padStart(2, '0')}.${currentDate.getFullYear()}`;
    
    const certNumber = `CERT-${currentDate.getFullYear()}-${Math.floor(Math.random() * 100000).toString().padStart(5, '0')}`;
    
    return `
    <!DOCTYPE html>
    <html>
    <head>
        <meta charset="UTF-8">
        <title>Сертифікат - ${courseName}</title>
        <style>
            body {
                margin: 0;
                padding: 0;
                font-family: 'Inter', sans-serif;
                background-color: #f8f9fa;
            }
            .certificate-container {
                width: 210mm;
                height: 297mm;
                margin: 0 auto;
                background-color: white;
                box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
                position: relative;
                overflow: hidden;
                padding: 20px;
                box-sizing: border-box;
            }
            .certificate-header {
                display: flex;
                justify-content: space-between;
                align-items: center;
                margin-bottom: 20px;
            }
            .certificate-logo {
                font-weight: bold;
                font-size: 24px;
                color: #283044;
                display: flex;
                align-items: center;
            }
            .certificate-title {
                text-align: center;
                font-size: 64px;
                font-weight: bold;
                color: #283044;
                margin: 40px 0;
            }
            .certificate-content {
                text-align: left;
                font-size: 24px;
                margin: 20px 0;
                line-height: 1.8;
            }
            .certificate-name {
                font-size: 42px;
                font-weight: bold;
                color: #283044;
                margin: 30px 0;
            }
            .certificate-course {
                font-size: 32px;
                font-weight: bold;
                margin: 30px 0;
                color: #283044;
            }
            .certificate-date {
                margin-top: 40px;
                font-size: 20px;
            }
            .certificate-number {
                position: absolute;
                bottom: 20px;
                right: 20px;
                font-size: 12px;
                color: #666;
            }
            .certificate-image {
                position: absolute;
                bottom: 100px;
                right: 50px;
                width: 150px;
                height: auto;
            }
            .certificate-stamp {
                position: absolute;
                left: 100px;
                bottom: 80px;
                width: 150px;
                height: auto;
                opacity: 0.9;
            }
            .background-shape {
                position: absolute;
                z-index: -1;
            }
            .shapes-container {
                position: absolute;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                overflow: hidden;
                z-index: -1;
            }
            .trophy {
                position: absolute;
                right: 50px;
                top: 50%;
                width: 150px;
                height: auto;
            }
            .person {
                position: absolute;
                left: 50%;
                bottom: 150px;
                width: 150px;
                height: auto;
            }
        </style>
    </head>
    <body>
        <div class="certificate-container">
            <div class="shapes-container">
                <!-- Декоративні елементи та фонові зображення -->
                <div class="background-shape" style="top: 50px; right: 50px; width: 100px; height: 100px; background-color: rgba(220, 236, 252, 0.5); border-radius: 50%;"></div>
                <div class="background-shape" style="bottom: 100px; left: 80px; width: 150px; height: 150px; background-color: rgba(220, 236, 252, 0.3); border-radius: 50%;"></div>
                <div class="background-shape" style="top: 200px; left: 50px; width: 80px; height: 80px; background-color: rgba(240, 240, 240, 0.8); border-radius: 50%;"></div>
            </div>
            
            <div class="certificate-header">
                <div class="certificate-logo">
                    <span>StudyWith</span>
                </div>
            </div>
            
            <div class="certificate-title">CERTIFICATE</div>
            
            <div class="certificate-content">
                <p>This certifies that</p>
                <div class="certificate-name">${userName.toUpperCase()}</div>
                <p>Has successfully completed<br>the course</p>
                <div class="certificate-course">${courseName}</div>
                <div class="certificate-date">
                    <p>Data of issue<br>${formattedDate}</p>
                </div>
            </div>
            
            <img class="certificate-stamp" src="../images/stamp.png" alt="Stamp">
            <img class="trophy" src="../images/trophy.png" alt="Trophy">
            <img class="person" src="../images/person.png" alt="Person">
            
            <div class="certificate-number">${certNumber}</div>
        </div>
    </body>
    </html>
    `;
}

async function convertHTMLToPDF(htmlContent) {
    try {
        const container = document.createElement('div');
        container.innerHTML = htmlContent;
        document.body.appendChild(container);
        
        const options = {
            margin: 0,
            filename: 'certificate.pdf',
            image: { type: 'jpeg', quality: 0.98 },
            html2canvas: { scale: 2, useCORS: true },
            jsPDF: { unit: 'mm', format: 'a4', orientation: 'landscape' }
        };
        
        const pdf = await html2pdf().from(container).set(options).outputPdf('blob');
        
        document.body.removeChild(container);
        
        return pdf;
    } catch (error) {
        console.error('Помилка при конвертації HTML в PDF:', error);
        throw new Error('Не вдалося створити сертифікат: ' + error.message);
    }
}



document.addEventListener('DOMContentLoaded', initializeCourseProgress);
document.addEventListener('DOMContentLoaded', function() {
    if (typeof html2pdf === 'undefined') {
        const script = document.createElement('script');
        script.src = 'https://cdnjs.cloudflare.com/ajax/libs/html2pdf.js/0.9.3/html2pdf.bundle.min.js';
        script.async = true;
        document.head.appendChild(script);
    }
    
    initializeCourseProgress();
});