const translations = {
    en: {
        pageTitle: 'StudyWith | Log in',
        LogIn: 'Log in',
        emailPlaceholder: 'Email',
        passwordPlaceholder: 'Password',
        signInButton: 'Sign In',
        forgotPasswordLink: 'Forgot password?',
    },
    ua: {
        pageTitle: 'StudyWith | Вхід',
        LogIn: 'Увiйти',
        emailPlaceholder: 'Електронна пошта',
        passwordPlaceholder: 'Пароль',
        signInButton: 'Увiйти',
        forgotPasswordLink: 'Забули пароль?',
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
            } else if (element.tagName === 'IMG') {
                element.setAttribute('alt', langData[langKey]);
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