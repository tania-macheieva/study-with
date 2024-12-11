document.addEventListener('DOMContentLoaded', () => {
    const goBackButton = document.querySelector('button');
    
    goBackButton.addEventListener('click', () => {
        window.location.href = '/confirm-email';
    });
});