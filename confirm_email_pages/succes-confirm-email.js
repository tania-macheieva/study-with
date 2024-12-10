document.addEventListener('DOMContentLoaded', () => {
    const startButton = document.querySelector('button');
    startButton.addEventListener('click', () => {
        // Очищаємо email з localStorage, оскільки верифікація завершена
        localStorage.removeItem('userEmail');
        // Перенаправляємо на головну сторінку
        window.location.href = '/';
    });
});