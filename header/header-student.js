document.addEventListener("DOMContentLoaded", () => {
  fetch("/header/header-student.html")
    .then((response) => response.text())
    .then((data) => {
      document.body.insertAdjacentHTML("afterbegin", data);

      const langSwitcher = document.querySelector('.lang-switcher');
      const currentLang = localStorage.getItem('language') || 'en';
      document.documentElement.lang = currentLang;

      const changeLanguage = (lang) => {
        localStorage.setItem('language', lang);
        document.documentElement.lang = lang; 
        location.reload(); // Перезавантажуємо сторінку
      };

      const applyHeaderLanguage = (lang) => {
        const langData = headerTranslations[lang];

        if (langData) {
          document.querySelectorAll("[data-lang]").forEach((element) => {
            const langKey = element.getAttribute("data-lang");
            if (langData[langKey]) {
              if (element.tagName === "INPUT") {
                element.setAttribute("placeholder", langData[langKey]);
              } else {
                element.textContent = langData[langKey];
              }
            }
          });
        } else {
          console.error(`No translations found for header language: ${lang}`);
        }
      };

      applyHeaderLanguage(currentLang);

      langSwitcher.addEventListener('click', (event) => {
        if (event.target.classList.contains('lang-btn')) {
          event.preventDefault();
          const selectedLang = event.target.dataset.lang;

          // Додаємо підтвердження перед зміною мови
          const confirmChange = confirm("Сторінка перезавантажиться для зміни мови. Продовжити?");
          if (confirmChange) {
            changeLanguage(selectedLang);
          }
        }
      });
    })
    .catch((error) => {
      console.error('Error loading header:', error);
    });
});

const headerTranslations = {
  en: {
    headerAll: "All Courses",
    headerAbout: "About",
    headerContact: "Contact",
    headerFAQ: "FAQ",
    headerSearch: "Search...",
    headerUser: "username",
  },
  ua: {
    headerAll: "Всi курси",
    headerAbout: "Про нас",
    headerContact: "Контакти",
    headerFAQ: "Поширенi питання",
    headerSearch: "Пошук...",
    headerUser: "Iм'я користувача",
  },
};
