const translations = {
    en: {
        pageTitle: 'StudyWith | Payment Success',
        successTitle: 'Payment was successful!',
        successDescription: 'Thank you for buying the course. Have a great learning time!',
        toHome: 'To the home page'
    },
    ua: {
        pageTitle: 'StudyWith | Успішний платіж',
        successTitle: 'Платіж успішно виконано!',
        successDescription: 'Дякуємо за покупку курсу. Бажаємо успішного навчання!',
        toHome: 'На головну сторінку'
    }
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
