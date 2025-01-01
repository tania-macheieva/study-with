const translations = {
    en: {
        pageTitle: 'Selected Courses | Empty',
        descriptionTitle: 'Your selected courses',
        descriptionText: 'This is where you can view the courses you\'ve marked as interesting, or start learning.',
        GoTo: 'Go to courses',
    },
    ua: {
        pageTitle: 'Вибрані курси | Пусто',
        descriptionTitle: 'Ваші вибрані курси',
        descriptionText: 'Тут ви можете переглянути курси, які ви відзначили як цікаві, або почати навчання.',
        GoTo: 'Перейти до курсів',
    },
};

function applyLanguage(lang) {
    const langData = translations[lang];

    document.title = langData.pageTitle;
    document.querySelector('[data-lang="descriptionTitle"]').textContent = langData.descriptionTitle;
    document.querySelector('[data-lang="descriptionText"]').textContent = langData.descriptionText;
    document.querySelector('[data-lang="GoTo"]').textContent = langData.GoTo;
    document.querySelectorAll('[data-lang="freeBadge"]').forEach(el => el.textContent = langData.freeBadge);
    document.querySelectorAll('[data-lang="removeButton"]').forEach(el => el.textContent = langData.removeButton);
    document.querySelectorAll('[data-lang="viewMore"]').forEach(el => el.textContent = langData.viewMore);

    // Переклад нових курсів
    const newCourses = [
        { name: langData.newCourse1, desc: langData.newCourse1Desc },
        { name: langData.newCourse2, desc: langData.newCourse2Desc },
        { name: langData.newCourse3, desc: langData.newCourse3Desc },
    ];

    const cards = document.querySelectorAll('.card');
    newCourses.forEach((course, index) => {
        if (cards[index + 4]) { // Assuming new courses start at index 4
            const card = cards[index + 4];
            card.querySelector('h3').textContent = course.name;
            card.querySelector('p').textContent = course.desc;
        }
    });

    // Переклад карток курсів 1-4
    const courses = [
        { name: langData.course1, desc: langData.course1Desc },
        { name: langData.course2, desc: langData.course2Desc },
        { name: langData.course3, desc: langData.course3Desc },
        { name: langData.course4, desc: langData.course4Desc },
    ];

    const courseCards = document.querySelectorAll('.course-cards .card');
    courses.forEach((course, index) => {
        if (courseCards[index]) {
            const card = courseCards[index];
            card.querySelector('h3').textContent = course.name;
            card.querySelector('p').textContent = course.desc;
        }
    });
}

document.addEventListener('DOMContentLoaded', () => {
    const userLang = localStorage.getItem('language'); // Default to 'en' if not set
    applyLanguage(userLang);
});
