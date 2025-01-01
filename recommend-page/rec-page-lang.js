const translations = {
    en: {
        pageTitle: 'StudyWith | Recommended',
        recommendedTitle: 'Recommended courses & groups for learning',
        recommendedDescription: 'Unlock your potential and discover new skills with our carefully selected online courses and groups. Start learning today!',
        courseName: 'Course name',
        courseDescription: 'Here should be the course description here should be the course description',
        freeBadge: 'Free',
        groupName: 'Group name',
        groupDescription: 'Here should be the group description here should be the group description',
    },
    ua: {
        pageTitle: 'StudyWith | Рекомендовані',
        recommendedTitle: 'Рекомендовані курси та групи для навчання',
        recommendedDescription: 'Розкрийте свій потенціал та відкрийте нові навички з нашими ретельно відібраними онлайн-курсами та групами. Почніть навчання сьогодні!',
        courseName: 'Назва курсу',
        courseDescription: 'Тут має бути опис курсу, тут має бути опис курсу',
        freeBadge: 'Безкоштовно',
        groupName: 'Назва групи',
        groupDescription: 'Тут має бути опис групи, тут має бути опис групи',
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
    const userLang = localStorage.getItem('language') || 'en'; // Якщо мова не встановлена, використовуємо англійську
    applyLanguage(userLang);
});
