document.addEventListener("DOMContentLoaded", () => {
  const hasAcceptedCookies = localStorage.getItem('cookiesAccepted');

  if (!hasAcceptedCookies) {
    const currentLang = localStorage.getItem('language') || 'en';
    document.documentElement.lang = currentLang;

    setTimeout(() => {
      fetch("/cookie/cookie.html")
        .then((response) => response.text())
        .then((data) => {
          document.body.insertAdjacentHTML("beforeend", data);

          translateCookie(currentLang);

          const acceptButton = document.querySelector('.accept');
          if (acceptButton) {
            acceptButton.addEventListener('click', handleAccept);
          }
        })
        .catch((error) => {
          console.error('Error loading cookie:', error);
        });
    }, 5000); 
  }
});

const handleAccept = () => {
  localStorage.setItem('cookiesAccepted', 'true');

  const cookieNotification = document.querySelector('.cookie-card');
  if (cookieNotification) {
    cookieNotification.style.display = 'none';
  }
};

const translateCookie = (lang) => {
  const langData = CookieTranslations[lang];

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
    console.error(`No translations found for cookie language: ${lang}`);
  }
};

const CookieTranslations = {
  en: {
    cookie_title: '🍪 Cookie Notice',
    cookie_description: 'We use cookies to ensure that we give you the best experience on our website.',
    cookie_link: 'Read cookies policies',
    cookie_manage: 'Manage your preferences',
    cookie_accept: 'Accept',
  },
  ua: {
    cookie_title: '🍪 Сповіщення про кукі',
    cookie_description: 'Ми використовуємо файли кукі, щоб забезпечити вам найкращий досвід на нашому вебсайті.',
    cookie_link: 'Прочитати політику використання кукі',
    cookie_manage: 'Налаштувати переваги',
    cookie_accept: 'Прийняти',
  },
};
