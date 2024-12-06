document.addEventListener("DOMContentLoaded", () => {
  fetch("footer.html")
    .then((response) => response.text())
    .then((data) => {
      document.body.insertAdjacentHTML("afterbegin", data);
    });
});
