document.addEventListener("DOMContentLoaded", () => {
    const groupCards = document.querySelector(".group-cards");
    const prevGroupButton = document.querySelector(".carousel-btn-1.prev-btn");
    const nextGroupButton = document.querySelector(".carousel-btn-1.next-btn");

    const cardWidth = document.querySelector(".group-card").offsetWidth + 68; // Ширина картки + gap
    const visibleCards = 3; 
    const totalCards = groupCards.children.length;

    let currentIndex = 0; 

    // Обробник для кнопки "назад"
    prevGroupButton.addEventListener("click", () => {
        currentIndex = (currentIndex <= 0) ? totalCards - visibleCards : currentIndex - 1;
        groupCards.style.transform = `translateX(-${currentIndex * cardWidth}px)`;
    });

    // Обробник для кнопки "вперед"
    nextGroupButton.addEventListener("click", () => {
        currentIndex = (currentIndex >= totalCards - visibleCards) ? 0 : currentIndex + 1;
        groupCards.style.transform = `translateX(-${currentIndex * cardWidth}px)`;
    });
});