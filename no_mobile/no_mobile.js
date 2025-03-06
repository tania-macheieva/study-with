document.addEventListener("DOMContentLoaded", () => {
    const hasAcceptedMobileNotice = localStorage.getItem('mobileNoticeAccepted');
    if (!hasAcceptedMobileNotice) {
        const currentLang = localStorage.getItem('language') || 'en';
        document.documentElement.lang = currentLang;

        setTimeout(() => {
            fetch("/no_mobile/no_mobile.html")
                .then((response) => response.text())
                .then((data) => {
                    document.body.insertAdjacentHTML("beforeend", data);

                    showMobileNotice(currentLang);

                    const acceptButton = document.querySelector('.accept');
                    if (acceptButton) {
                        acceptButton.addEventListener('click', handleMobileNoticeAccept);
                    }
                })
                .catch((error) => {
                    console.error('Error loading mobile notice:', error);
                });
        }, 2000); 
    }
});

const showMobileNotice = (currentLang) => {
    const mobileNoticeHTML = `
        <div class="mobile-card" id="mobileNotice">
            <span class="title_mobile">${MobileNoticeTranslations[currentLang].mobile_title}</span>
            <p class="description_mobile">${MobileNoticeTranslations[currentLang].mobile_description}</p>
            <div class="actions"> 
                <button class="accept" id="acceptButton">${MobileNoticeTranslations[currentLang].mobile_accept}</button>
            </div>
        </div>
    `;
    
    document.body.insertAdjacentHTML("beforeend", mobileNoticeHTML);
    const mobileNotice = document.getElementById('mobileNotice');
    mobileNotice.style.display = 'block'; // Відображаємо спливаюче повідомлення
    // Додаємо обробник для кнопки "Got it!"
    const acceptButton = document.getElementById('acceptButton');
    if (acceptButton) {
        acceptButton.addEventListener('click', handleMobileNoticeAccept);
    }
};

const handleMobileNoticeAccept = () => {
    localStorage.setItem('mobileNoticeAccepted', 'true'); // Зберігає значення в localStorage
    const mobileNotice = document.getElementById('mobileNotice');
    if (mobileNotice) {
        mobileNotice.style.display = 'none';
    }
};

const MobileNoticeTranslations = {
    en: {
        mobile_title: '🚫 Mobile Version Notice',
        mobile_description: 'Our website does not currently support a mobile version. We are working on it!',
        mobile_link: 'Learn more about upcoming updates',
        mobile_accept: 'Got it!',
    },
    ua: {
        mobile_title: '🚫 Сповіщення про мобільну версію',
        mobile_description: 'Наш сайт наразі не підтримує мобільну версію. Ми працюємо над її створенням!',
        mobile_link: 'Дізнатися більше про майбутні оновлення',
        mobile_accept: 'Зрозуміло!',
    },
};
