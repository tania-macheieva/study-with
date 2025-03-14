const translations = {
  en: {
    pageTitle: "StudyWith | Course preview",
    category: "Category",
    edlevel: "Educational level",
    duration: "Duration",
    price: "Price",
    signup: "Sign Up",
    speaker: "Course speaker",
    modules: "Course modules",
    reviews: "Course reviews",
  },
  ua: {
    pageTitle: "StudyWith | Передогляд курсу",
    category: "Категорія",
    edlevel: "Навчальний рівень",
    duration: "Тривалість",
    price: "Ціна",
    signup: "Зареєструватись",
    speaker: "Викладач курсу",
    modules: "Теми курсу",
    reviews: "Відгуки на курс",
  }
};

function applyLanguage(lang) {
  const langData = translations[lang];

  document.title = langData.pageTitle;

  document.querySelectorAll("[data-lang]").forEach((element) => {
    const langKey = element.getAttribute("data-lang");
    if (langData[langKey]) {
      if (element.tagName === "INPUT") {
        element.setAttribute("placeholder", langData[langKey]);
      } else if (element.tagName === "BUTTON") {
        element.textContent = langData[langKey];
      } else if (element.tagName === "H2") {
        element.textContent = langData[langKey];
      } else if (element.tagName === "P") {
        element.textContent = langData[langKey];
      } else {
        element.innerHTML = langData[langKey];
      }
    }
  });
}

document.addEventListener("DOMContentLoaded", () => {
  const userLang = localStorage.getItem("language");
  applyLanguage(userLang);
});