const translations = {
    en: {
        pageTitle: 'StudyWith',
        formTitle: 'Create an account <br>as a user',
        namePlaceholder: 'Name',
        emailPlaceholder: 'Email',
        passwordPlaceholder: 'Password',
        privacyPolicyText: 'I accept the',
        privacyPolicyLinkText: 'Privacy Policy',
        signUpButton: 'Sign Up',
        orText: 'or',
    },
    ua: {
        pageTitle: 'StudyWith',
        formTitle: 'Створіть акаунт <br>як користувач',
        namePlaceholder: 'Ім\'я',
        emailPlaceholder: 'Електронна пошта',
        passwordPlaceholder: 'Пароль',
        privacyPolicyText: 'Я приймаю',
        privacyPolicyLinkText: 'Політику конфіденційності',
        signUpButton: 'Зареєструватися',
        orText: 'або',
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
    const userLang = localStorage.getItem('language'); // Якщо мова не встановлена, використовуємо англійську
    applyLanguage(userLang);
});
