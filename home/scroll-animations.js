function handleScrollAnimations() {
  // Use requestAnimationFrame to limit scroll handler execution
  requestAnimationFrame(() => {
    const animatedElements = document.querySelectorAll(".fade-in, .text-animate, .img-animate");
    
    animatedElements.forEach((element) => {
      if (!element.classList.contains("visible")) {
        const position = element.getBoundingClientRect();
        if (position.top < window.innerHeight - 100) {
          element.classList.add("visible");
        }
      }
    });
  });
}

document.addEventListener("DOMContentLoaded", () => {
  handleScrollAnimations(); // Initial state
  
  // Use passive listener to improve performance
  window.addEventListener("scroll", handleScrollAnimations, { passive: true });
});