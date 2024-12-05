document.addEventListener("DOMContentLoaded", () => {
    const coursesCards = document.querySelector(".carousel-track");
    const prevCoursesButton = document.querySelector(".carousel-container .prev-btn");
    const nextCoursesButton = document.querySelector(".carousel-container .next-btn");

    const cardWidth = document.querySelector(".card").offsetWidth + 30; // Ширина картки + gap
    const visibleCards = 4; 
    const totalCards = coursesCards.children.length;

    let currentIndex = 0; 

    // Обробник для кнопки "назад"
    prevCoursesButton.addEventListener("click", () => {
        currentIndex = (currentIndex <= 0) ? totalCards - visibleCards : currentIndex - 1;
        coursesCards.style.transform = `translateX(-${currentIndex * cardWidth}px)`;
    });

    // Обробник для кнопки "вперед"
    nextCoursesButton.addEventListener("click", () => {
        currentIndex = (currentIndex >= totalCards - visibleCards) ? 0 : currentIndex + 1;
        coursesCards.style.transform = `translateX(-${currentIndex * cardWidth}px)`;
    });
});




