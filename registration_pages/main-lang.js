const translations = {
    en: {
        pageTitle: 'StudyWith | Register',
        welcomeText: 'Welcome to StudyWith!<br>Learn, connect, succeed together!',
        createAcc:'Create an account as a',
        student:'Student',
        teacher:'Teacher',
    },
    ua: {
        pageTitle: 'StudyWith | Реєстрація',
        welcomeText: 'Ласкаво просимо в StudyWith!<br>Навчайтеся, спілкуйтеся, досягайте разом!',
        createAcc:'Створити аккаунт як',
        student:'Студент',
        teacher:'Викладач',
    },
};

function applyLanguage(lang) {
    const langData = translations[lang];

    document.title = langData.pageTitle;
    document.querySelector('[data-lang="welcomeText"]').innerHTML = langData.welcomeText;
    document.querySelectorAll('[data-lang="createAcc"]').forEach(el => {
        el.firstChild.textContent = langData.createAcc + " ";
    });
    document.querySelector('[data-lang="student"]').textContent = langData.student;
    document.querySelector('[data-lang="teacher"]').textContent = langData.teacher;
}

document.addEventListener('DOMContentLoaded', () => {
    const userLang = localStorage.getItem('language');
    console.log('Loaded language:', userLang);
    console.log('Translations:', translations[userLang]);
    applyLanguage(userLang);
  });