document.addEventListener("DOMContentLoaded", () => {
  fetch("/header/header-teacher.html")
    .then((response) => response.text())
    .then((data) => {
      document.body.insertAdjacentHTML("afterbegin", data);

      const langSwitcher = document.querySelector('.lang-switcher');

      const currentLang = localStorage.getItem('language') || 'en';
      document.documentElement.lang = currentLang;

      const changeLanguage = (lang) => {
        localStorage.setItem('language', lang);
        document.documentElement.lang = lang; 
      };

      langSwitcher.addEventListener('click', (event) => {
        if (event.target.classList.contains('lang-btn')) {
          event.preventDefault();
          const selectedLang = event.target.dataset.lang;
          changeLanguage(selectedLang);
        }
      });
    })
    .catch((error) => {
      console.error('Error loading header:', error);
    });
});
