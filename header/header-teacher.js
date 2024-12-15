document.addEventListener("DOMContentLoaded", () => {
  fetch("/header/header-teacher.html")
    .then((response) => response.text())
    .then((data) => {
      document.body.insertAdjacentHTML("afterbegin", data);
    });
});
