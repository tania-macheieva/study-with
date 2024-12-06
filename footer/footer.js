document.addEventListener("DOMContentLoaded", () => {
  // Створюємо контейнер для футера
  const footerContainer = document.createElement("div");
  document.body.appendChild(footerContainer);

  // Завантажуємо футер із файлу footer.html
  fetch("footer.html")
      .then(response => {
          if (!response.ok) throw new Error("Cannot load footer!");
          return response.text();
      })
      .then(html => {
          footerContainer.innerHTML = html;
      })
      .catch(error => console.error("Error loading footer:", error));
});
