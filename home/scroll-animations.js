function handleScrollAnimations() {
    const animatedElements = document.querySelectorAll(
      ".fade-in, .text-animate, .img-animate"
    );
  
    animatedElements.forEach((element) => {
        const position = element.getBoundingClientRect();
        if (position.top < window.innerHeight - 100) {
          element.classList.add("visible");
        }
      });
    }
    
    document.addEventListener("DOMContentLoaded", () => {
      handleScrollAnimations(); // Початковий стан
      window.addEventListener("scroll", handleScrollAnimations);
    });
  