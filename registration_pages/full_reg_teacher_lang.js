const translations = {
    en: {
        pageTitle: 'StudyWith | Register',
        personalInfo: "Personal Information",
        dobLabel: "Date of birth",
        dobPlaceholder: "Date of your birth",
        genderLabel: "Gender",
        genderOptions: { men: "Men", women: "Women", other: "Other" },
        countryLabel: "Country",
        countryPlaceholder: "Country",
        cityLabel: "City",
        cityPlaceholder: "City",
        phoneLabel: "Phone number",
        phonePlaceholder: "Phone",
        zipLabel: "Zip code",
        zipPlaceholder: "Zip code",
        professionalInfo: "Professional Information",
        specialtyLabel: "Specialty:",
        specialtyPlaceholder: "Your specialty",
        experienceLabel: "Beginning of Professional Experience:",
        certificatesLabel: "Download certificates, diplomas, etc.",
        certificatesInfo: "(Upload any files that prove your qualifications)",
        chooseFileButton: "Choose File",
        noFileChosen: "No file chosen",
        aboutInfo: "Additional Information",
        aboutDescription:"(Fill in this field as desired)",
        aboutPlaceholder: "Write a short information about yourself and your teaching experience.",
        aboutPlaceholder_1:"Write about yourself...",
        successHeader: "Thank you for registering!",
        successInfo: "The documents you submitted to confirm your qualifications will be reviewed by our team. We will send a response to your email within a few hours or, at most, up to 2 days. Thank you for your trust and your interest in joining our platform!",
        finishButton: "Finish",
        prevButton: "Previous",
        nextButton: " Next",
        wrongFormat: "(Only PDF format allowed)",

        requiredFieldError: "This field is required",
        fileError: "No file chosen",
        emailMissing: "Email is required",
        phoneMissing: "Phone number is required",

    },
    ua: {
        pageTitle: 'StudyWith | Реєстрація',
        personalInfo: "Особиста інформація",
        dobLabel: "Дата народження",
        dobPlaceholder: "Дата вашого народження",
        genderLabel: "Стать",
        genderOptions: { men: "Чоловік", women: "Жінка", other: "Інше" },
        countryLabel: "Країна",
        countryPlaceholder: "Країна",
        cityLabel: "Місто",
        cityPlaceholder: "Місто",
        phoneLabel: "Номер телефону",
        phonePlaceholder: "Телефон",
        zipLabel: "Поштовий індекс",
        zipPlaceholder: "Індекс",
        professionalInfo: "Професійна інформація",
        specialtyLabel: "Спеціальність:",
        specialtyPlaceholder: "Ваша спеціальність",
        experienceLabel: "Початок професійного досвіду:",
        certificatesLabel: "Завантажте сертифікати, дипломи тощо.",
        certificatesInfo: "(Завантажте будь-які файли, які підтверджують ваші кваліфікації)",
        chooseFileButton: "Обрати файл",
        noFileChosen: "Файл не обрано",
        aboutInfo: "Додаткова інформація",
        aboutPlaceholder: "Напишіть коротку інформацію про себе та свій досвід викладання..",
        aboutPlaceholder_1:"Напишіть про себе...",
        aboutDescription:"(Заповніть це поле за бажанням)",
        successHeader: "Дякуємо за реєстрацію!",
        successInfo: "Документи, які ви надіслали для підтвердження кваліфікацій, будуть перевірені нашою командою. Ми надішлемо відповідь на вашу електронну пошту протягом кількох годин або максимум до 2 днів. Дякуємо за довіру та інтерес до нашої платформи!",
        finishButton: "Завершити",
        prevButton: "Назад",
        nextButton: " Далі",
        wrongFormat: "(Допускається тільки формат PDF)",
        
        requiredFieldError: "Це поле є обов'язковим",
        fileError: "Файл не обрано",
        emailMissing: "Необхідно вказати електронну пошту",
        phoneMissing: "Необхідно вказати номер телефону",
    }
};


function applyLanguage(lang) {
    console.log('Applying language:', lang);
    const langData = translations[lang];
    if (!langData) {
        console.error('Translation not found for language:', lang);
        return;
    }
    document.title = langData.pageTitle;

    document.querySelectorAll('[data-lang]').forEach(element => {
        const langKey = element.getAttribute('data-lang');
        
        if (langKey === 'genderOptions') {
            const value = element.getAttribute('data-value'); 
            if (langData.genderOptions && langData.genderOptions[value]) {
                element.textContent = langData.genderOptions[value];
            }
            return;
        }

        if (langData[langKey]) {
            if (element.tagName === 'INPUT') {
                element.setAttribute('placeholder', langData[langKey]);
            } else if (element.tagName === 'TEXTAREA') {
                element.setAttribute('placeholder', langData[langKey]);  
            } else if (element.tagName === 'BUTTON') {
                element.textContent = langData[langKey];
            } else if (element.tagName === 'H2' || element.tagName === 'H1') {
                element.textContent = langData[langKey];
            } else if (element.tagName === 'P' || element.tagName === 'SPAN') {
                element.textContent = langData[langKey];
            } else {
                element.innerHTML = langData[langKey];
            }
        } else {
            console.warn(`No translation found for: ${langKey}`);
        }
    });
}

document.addEventListener('DOMContentLoaded', () => {
    const userLang = localStorage.getItem('language') || 'en';
    console.log('Initial language:', userLang); 
    applyLanguage(userLang);
});

window.changeLanguage = function(lang) {
    console.log('Change language called:', lang);
    localStorage.setItem('language', lang);
    applyLanguage(lang);
};