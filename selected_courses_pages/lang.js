const translations = {
    en: {
        pageTitle: 'Selected Courses',
        descriptionTitle: 'Your selected courses',
        descriptionText: 'This is where you can view the courses you\'ve marked as interesting, or start learning.',
        freeBadge: 'Free',
        removeButton: 'Remove',
        viewMore: '→',
        newCourse1: 'New Course 1',
        newCourse1Desc: 'Description for New Course 1',
        newCourse2: 'New Course 2',
        newCourse2Desc: 'Description for New Course 2',
        newCourse3: 'New Course 3',
        newCourse3Desc: 'Description for New Course 3',
        course1: 'Course name',
        course1Desc: 'Here should be the course description here should be the course description',
        course2: 'Course name',
        course2Desc: 'Here should be the course description here should be the course description',
        course3: 'Course name',
        course3Desc: 'Here should be the course description here should be the course description',
        course4: 'Course name',
        course4Desc: 'Here should be the course description here should be the course description'
    },
    ua: {
        pageTitle: 'Вибрані курси',
        descriptionTitle: 'Ваші вибрані курси',
        descriptionText: 'Тут ви можете переглянути курси, які ви відзначили як цікаві, або почати навчання.',
        freeBadge: 'Немає ціни',
        removeButton: 'Видалити',
        viewMore: '→',
        newCourse1: 'Новий курс 1',
        newCourse1Desc: 'Опис нового курсу 1',
        newCourse2: 'Новий курс 2',
        newCourse2Desc: 'Опис нового курсу 2',
        newCourse3: 'Новий курс 3',
        newCourse3Desc: 'Опис нового курсу 3',
        course1: 'Назва курсу',
        course1Desc: 'Тут має бути опис курсу, тут має бути опис курсу',
        course2: 'Назва курсу',
        course2Desc: 'Тут має бути опис курсу, тут має бути опис курсу',
        course3: 'Назва курсу',
        course3Desc: 'Тут має бути опис курсу, тут має бути опис курсу',
        course4: 'Назва курсу',
        course4Desc: 'Тут має бути опис курсу, тут має бути опис курсу'
    },
};

function applyLanguage(lang) {
    const langData = translations[lang];

    document.title = langData.pageTitle;
    document.querySelector('[data-lang="descriptionTitle"]').textContent = langData.descriptionTitle;
    document.querySelector('[data-lang="descriptionText"]').textContent = langData.descriptionText;

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
