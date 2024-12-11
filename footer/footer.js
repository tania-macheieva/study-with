document.addEventListener("DOMContentLoaded", () => {
  fetch("/footer/footer.html")
      .then((response) => response.text())
      .then((data) => {
          document.body.insertAdjacentHTML("beforeend", data);
      });
});
