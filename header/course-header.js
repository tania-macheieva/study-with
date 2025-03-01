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
        const userName = userData.name;

        const courseResponse = await fetch(`/api/courses/${courseId}`);
        if (!courseResponse.ok) {
            throw new Error('Помилка отримання даних курсу');
        }
        const courseData = await courseResponse.json();
        const courseName = courseData.name;

        const currentDate = new Date();
        const formattedDate = `${currentDate.getDate().toString().padStart(2, '0')}.${(currentDate.getMonth() + 1).toString().padStart(2, '0')}.${currentDate.getFullYear()}`;
        const certNumber = `CERT-${currentDate.getFullYear()}-${Math.floor(Math.random() * 100000).toString().padStart(5, '0')}`;

        const response = await fetch('/api/certificate/generate', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                userId,
                courseId
            })
        });
        
        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.details || 'Помилка генерації сертифікату');
        }
        
        const pdfBlob = await response.blob();
        
        const blobUrl = URL.createObjectURL(pdfBlob);
        
        const downloadLink = document.createElement('a');
        downloadLink.href = blobUrl;
        downloadLink.download = `Certificate_${courseId}.pdf`;
        
        document.body.appendChild(downloadLink);
        downloadLink.click();
        document.body.removeChild(downloadLink);
        
        setTimeout(() => URL.revokeObjectURL(blobUrl), 100);
        
    } catch (error) {
        console.error('Помилка генерації сертифікату:', error);
        alert('Помилка при створенні сертифікату: ' + error.message);
    }
}

function createCertificateTemplate(userName, courseName) {
    const currentDate = new Date();
    const formattedDate = `${currentDate.getDate().toString().padStart(2, '0')}.${(currentDate.getMonth() + 1).toString().padStart(2, '0')}.${currentDate.getFullYear()}`;
    
    const certNumber = `CERT-${currentDate.getFullYear()}-${Math.floor(Math.random() * 100000).toString().padStart(5, '0')}`;
    
    return `
<!DOCTYPE html>
<html lang="en">

<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Certificate</title>
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@100..900&display=swap" rel="stylesheet">
    <link rel="stylesheet" href="../certificates/certificate1.css">
</head>

<style>
body {
    background-color: #cecece;
    font-family: 'Inter', sans-serif;
    margin: 0;
    padding: 0;
    display: flex;
    justify-content: center;
    align-items: center;
    height: 100vh;
}

.certificate {
    padding: 20px;
    position: relative;
    width: 2000px;
    height: auto;
}

.certificate-image {
    width: 100%;
    display: block;
}

.content {
    position: absolute;
    top: 55%;
    left: 45%;
    transform: translate(-50%, -50%);
    width: 80%;
    text-align: left;
}

.logo {
    width: 36px;
    height: 36px;
    vertical-align: middle;
}

h2 {
    font-size: 36px;
    font-weight: 500;
    display: flex;
    align-items: left;
    justify-content: left;
    gap: 16px;
    margin-bottom: 20px;
}

h1 {
    font-size: 68px;
    font-weight: bold;
    margin-bottom: 40px;
}

p {
    font-size: 24px;
    margin-bottom: 10px;
}

h3 {
    font-size: 32px;
    font-weight: bold;
    margin-bottom: 30px;
}

.p1{
    margin-top: 30px;
}
.cert-number {
    font-size: 20px;
    margin-top: 90px;
}

.signature {
    position: absolute;
    bottom: 50px;
    left: 30%;
    transform: translateX(-50%);
    width: 200px;
}
</style>

<body>
    <div class="certificate">
        <img class="certificate-image" src="../images/certificate1.png" alt="certificate">
        <div class="content">
            <h2><img class="logo" src="../images/menu-logo.png" alt="logo"> StudyWith</h2>
            <h1>CERTIFICATE</h1>
            <p>This certifies that</p>
            <h3>${userName.toUpperCase()}</h3>
            <p>Has successfully completed the course</p>
            <h3>${courseName}</h3>
            <p >Date of issue:${formattedDate}</p>
            <p>2020-01-01</p>
            <p class="cert-number">${certNumber}</p>
            <img class="signature" src="../images/signature1.png" alt="signature">
        </div>
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