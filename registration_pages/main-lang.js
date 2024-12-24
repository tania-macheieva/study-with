const translations = {
    en: {
        pageTitle: 'StudyWith | Register',
        welcomeText: 'Welcome to StudyWith!<br>Learn, connect, succeed together!',
        studentAccount: 'Create an account as a student',
        teacherAccount: 'Create an account as a teacher',
    },
    ua: {
        pageTitle: 'StudyWith | Реєстрація',
        welcomeText: 'Ласкаво просимо в StudyWith!<br>Навчайтеся, спілкуйтеся, досягайте разом!',
        studentAccount: 'Створити акаунт як студент',
        teacherAccount: 'Створити акаунт як викладач',
    },
};

function applyLanguage(lang) {
    const langData = translations[lang];

    document.title = langData.pageTitle;
    document.querySelector('[data-lang="welcomeText"]').innerHTML = langData.welcomeText;
    document.querySelector('[data-lang="studentAccount"]').textContent = langData.studentAccount;
    document.querySelector('[data-lang="teacherAccount"]').textContent = langData.teacherAccount;
}

document.addEventListener('DOMContentLoaded', () => {
    const userLang = localStorage.getItem('language'); // Default to 'en' if not set
    applyLanguage(userLang);
});
