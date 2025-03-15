const translations = {
  en: {
    pageTitle: "StudyWith | Course preview",
    category: "Category",
    edlevel: "Educational level",
    duration: "Duration",
    price: "Price",
    signup: "Sign Up",
    speaker: "About the author",
    modules: "Course modules",
    reviews: "Course reviews",
    seeMore: "see more",
    seeLess: "see less",
    free: "Free",
    noReviews: "No reviews available",
    noAuthorInfo: "No information about the author",
    noModules: "No modules available",
    noLectures: "No lectures available",
    today: "today",
    yesterday: "yesterday",
    rateLabel: "rate:",
    noComment: "No comment",
    showAll: "Show all",
    noReviewsWithRating: "There are no reviews with this rating.",
    goToCourse: "Go to course",
    bookmarkAdded: "Course added to bookmarks",
    bookmarkRemoved: "Course removed from bookmarks",
    pleaseLogin: "Please log in to add course to bookmarks",
    bookmarkError: "Error changing bookmark",
    urlCopied: "Course URL copied to clipboard",
    urlCopyFailed: "Failed to copy URL",
    enrollSuccess: "You have successfully enrolled in the course!",
    weeks: "weeks",

    "Programming": "Programming",
    "Design": "Design",
    "Marketing": "Marketing",
    "Business": "Business",
    "Languages": "Languages",
    "Finance": "Finance",
    "Personal Development": "Personal Development",
    "Art": "Art",
    "Psychology": "Psychology",
    "Health": "Health",
    "Cooking": "Cooking",
    "Science": "Science",
    "Game Development": "Game Development",
    "Childcare": "Childcare",
    "No level": "No level",
    "Basic level": "Basic",
    "Intermediate level": "Intermediate",
    "Advanced level": "Advanced",
  },
  ua: {
    pageTitle: "StudyWith | Передогляд курсу",
    category: "Категорія",
    edlevel: "Навчальний рівень",
    duration: "Тривалість",
    price: "Ціна",
    signup: "Зареєструватись",
    speaker: "Про автора",
    modules: "Теми курсу",
    reviews: "Відгуки",
    seeMore: "показати більше",
    seeLess: "показати менше",
    free: "Безкоштовно",
    noReviews: "Відгуки відсутні",
    noAuthorInfo: "Інформація про автора відсутня",
    noModules: "Інформація про модулі відсутня",
    noLectures: "Немає доступних лекцій",
    today: "сьогодні",
    yesterday: "вчора",
    rateLabel: "оцінка:",
    noComment: "Без коментаря",
    showAll: "Показати всі",
    noReviewsWithRating: "Відгуків з такою оцінкою немає.",
    goToCourse: "Перейти до навчання",
    bookmarkAdded: "Курс додано в закладки",
    bookmarkRemoved: "Курс видалено із закладок",
    pleaseLogin: "Будь ласка, увійдіть у систему, щоб додати курс у закладки",
    bookmarkError: "Помилка зміни закладки",
    urlCopied: "URL курсу скопійовано в буфер обміну",
    urlCopyFailed: "Не вдалося скопіювати URL",
    enrollSuccess: "Ви успішно записались на курс!",
    weeks: "тижнів",
    "Programming": "Програмування",
    "Design": "Дизайн",
    "Marketing": "Маркетинг",
    "Business": "Бізнес",
    "Languages": "Мови",
    "Finance": "Фінанси",
    "Personal Development": "Особистий розвиток",
    "Art": "Мистецтво",
    "Psychology": "Психологія",
    "Health": "Здоров'я",
    "Cooking": "Кулінарія",
    "Science": "Наука",
    "Game Development": "Розробка ігор",
    "Childcare": "Догляд за дітьми",
    "No level": "Без рівня",
    "Basic level": "Початковий",
    "Intermediate level": "Середній",
    "Advanced level": "Просунутий",
  }
};

function applyLanguage(lang) {
  if (!lang || !translations[lang]) {
    lang = 'en'; 
  }
  
  const langData = translations[lang];
  document.title = langData.pageTitle;
  
  document.querySelectorAll("[data-lang]").forEach((element) => {
    const langKey = element.getAttribute("data-lang");
    if (langData[langKey]) {
      if (element.tagName === "INPUT") {
        element.setAttribute("placeholder", langData[langKey]);
      } else if (element.tagName === "BUTTON") {
        element.textContent = langData[langKey];
      } else {
        element.textContent = langData[langKey];
      }
    }
  });
}

function setupLanguageListener() {
  const userLang = localStorage.getItem("language") || 'en';
  window.currentLanguage = userLang;
  applyLanguage(userLang);
  
  window.addEventListener('storage', (event) => {
    if (event.key === 'language') {
      window.currentLanguage = event.newValue;
      applyLanguage(event.newValue);
    }
  });
}

document.addEventListener("DOMContentLoaded", setupLanguageListener);

window.translations = translations;
window.getCurrentLanguage = function() {
  return window.currentLanguage || localStorage.getItem("language") || 'en';
};