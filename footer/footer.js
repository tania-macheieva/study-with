document.addEventListener("DOMContentLoaded", () => {
  // Отримуємо поточну мову з локального сховища або використовуємо 'en' за замовчуванням
  const currentLang = localStorage.getItem('language') || 'en';
  document.documentElement.lang = currentLang;

  fetch("/footer/footer.html")
    .then((response) => response.text())
    .then((data) => {
      document.body.insertAdjacentHTML("beforeend", data);

      // Перекладаємо футер відповідно до поточної мови
      translateFooter(currentLang);
    })
    .catch((error) => {
      console.error('Error loading footer:', error);
    });
});

// Функція для перекладу футера
const translateFooter = (lang) => {
  const langData = footerTranslations[lang];

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
    console.error(`No translations found for footer language: ${lang}`);
  }
};

// Дані перекладу для футера
const footerTranslations = {
  en: {
    footerReserved: "© 2025 All Rights Reserved StudyWith",
    footerAbout: "About",
    footerContact: "Contact",
    footerFAQ: "FAQ",
    footerTnC: "Terms & conditions",
    footerPrivacy: "Privacy policy",
    footerDonate: "Donations",

  },
  ua: {
    footerReserved: "© 2025 Всі права захищені StudyWith",
    footerAbout: "Про нас",
    footerContact: "Контакти",
    footerFAQ: "Поширені питання",
    footerTnC: "Умови та положення",
    footerPrivacy: "Політика конфіденційності",
    footerDonate: "Донати",
  },
};
