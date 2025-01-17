const translations = {
    en: {
        title: 'StudyWith | Profile',
        hobbies: 'Hobbies',
        languages: 'Languages',
        aboutMe: 'About me',
        education: 'Education',
        experience: 'Experience',
        myCourses: 'My courses',
        review: 'Student reviews',
        viewAll: 'View all',
        viewLess: 'View less',  
        btnResume: 'Learn more',
        showMore: 'Show more...',
        showLess: 'Show less'  
    },
    ua: {
        title: 'StudyWith | Профіль',
        hobbies: 'Хобі',
        languages: 'Мови',
        aboutMe: 'Про мене',
        education: 'Освіта',
        experience: 'Досвід',
        myCourses: 'Мої курси',
        review: 'Відгуки студентів',
        viewAll: 'Переглянути все',
        viewLess: 'Згорнути',   
        btnResume: 'Дізнатися більше',
        showMore: 'Більше...',
        showLess: 'Сховати'  
    }
};

function applyLanguage(lang) {
    const elements = document.querySelectorAll('[data-lang]');
    elements.forEach(element => {
        const key = element.getAttribute('data-lang');
        if (translations[lang] && translations[lang][key]) {
            if (element.tagName === 'TITLE') {
                element.textContent = translations[lang][key];
            } else if (element.tagName === 'BUTTON' || element.tagName === 'SPAN') {
                element.textContent = translations[lang][key];
            } else {
                const img = element.querySelector('img');
                if (img) {
                    element.innerHTML = `${img.outerHTML} ${translations[lang][key]}`;
                } else {
                    element.textContent = translations[lang][key];
                }
            }
        }
    });
}

document.addEventListener('DOMContentLoaded', () => {
    const userLang = localStorage.getItem('language') || 'en';
    applyLanguage(userLang);

    window.addEventListener('languageChange', (event) => {
        const selectedLang = event.detail.language;
        applyLanguage(selectedLang);
    });
});