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
    },
    ua: {
        pageTitle: 'Study With | Профіль',
        username: 'Ім’я користувача',
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
    },
};

function applyLanguage(lang) {
    const langData = translations[lang];

    document.title = langData.pageTitle;

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

document.addEventListener('DOMContentLoaded', () => {
    const userLang = localStorage.getItem('language'); 
    applyLanguage(userLang);
});
