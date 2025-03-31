const translations = {
    ua: {
        pageTitle: "Перевірка сертифікату",
        checkCertHeader: "Перевірте свій сертифікат тут!",
        certInputPlaceholder: "Приклад: CERT-2025-12345",
        verifying: "Перевірка",
        validCertMessage: "Ваш сертифікат дійсний",
        invalidCertMessage: "Ваш сертифікат недійсний",
        certDetailsHeader: "Деталі сертифікату",
        certOwnerName: "Ім'я власника:",
        certCourseName: "Назва курсу:",
        certIssueDate: "Дата видачі:",
        certNumber: "Номер сертифікату:",
        checkCertButton: "Перевірити сертифікат",
        enterCertNumber: "Будь ласка, введіть номер сертифікату",
        verificationError: "Помилка при перевірці сертифікату. Спробуйте пізніше."
    },
    en: {
        pageTitle: "Certificate Verification",
        checkCertHeader: "Check your certificate here!",
        certInputPlaceholder: "Example: CERT-2025-12345",
        verifying: "Verifying",
        validCertMessage: "Your certificate is valid",
        invalidCertMessage: "Your certificate is not valid",
        certDetailsHeader: "Certificate Details",
        certOwnerName: "Owner name:",
        certCourseName: "Course name:",
        certIssueDate: "Issue date:",
        certNumber: "Certificate number:",
        checkCertButton: "Verify certificate",
        enterCertNumber: "Please enter a certificate number",
        verificationError: "Error verifying certificate. Please try again later."
    },
};

function applyLanguage(lang) {
    const langData = translations[lang];

    document.title = langData.pageTitle;

    document.querySelectorAll('[data-lang]').forEach(element => {
        const langKey = element.getAttribute('data-lang');
        if (langData[langKey]) {
            if (element.tagName === 'INPUT') {
                element.setAttribute('placeholder', langData[langKey]);
            } else if (element.tagName === 'BUTTON') {
                element.textContent = langData[langKey];
            } else if (element.tagName === 'A') {
                element.textContent = langData[langKey];
            } else if (element.tagName === 'SPAN') {
                element.textContent = langData[langKey];
            } else {
                element.innerHTML = langData[langKey];
            }
        }
    });
}

document.addEventListener('DOMContentLoaded', () => {
    const userLang = localStorage.getItem('language') || 'en'; 
    applyLanguage(userLang);
});