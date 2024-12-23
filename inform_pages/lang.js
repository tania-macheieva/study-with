document.addEventListener("DOMContentLoaded", () => {
    let currentLang = localStorage.getItem('language') || 'ua';

    const translations = {
      en: {
        title: 'Contact',
        description: 'Do you have any questions? We would be glad to receive your message.',
        email: 'studywith.connect@gmail.com',
        callBack: 'We will call you back',
        meetInPerson: 'Meet in person',
      },
      ua: {
        title: 'Контакти',
        description: 'У вас є питання? Ми будемо раді отримати ваше повідомлення.',
        email: 'studywith.connect@gmail.com',
        callBack: 'Ми передзвонимо вам',
        meetInPerson: 'Зустрітись особисто',
      },
    };

    const updateTextForLanguage = (lang) => {
      document.querySelector('h1').textContent = translations[lang].title;
      document.querySelector('.email-box p').textContent = translations[lang].description;
      document.querySelector('.email-button').textContent = translations[lang].email;
      document.querySelectorAll('.small-box p')[0].textContent = translations[lang].callBack;
      document.querySelectorAll('.small-box p')[1].textContent = translations[lang].meetInPerson;
      localStorage.setItem('language', lang);
    };
  
    updateTextForLanguage(currentLang);

    const langSwitcher = document.querySelector('.lang-switcher'); 
  
    if (langSwitcher) {
      langSwitcher.addEventListener('click', (event) => {
        if (event.target.classList.contains('lang-btn')) {
          event.preventDefault();
          const selectedLang = event.target.dataset.lang;
          currentLang = selectedLang;  

          updateTextForLanguage(selectedLang);
        }
      });
    }
  });
  