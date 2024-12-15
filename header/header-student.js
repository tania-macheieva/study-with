document.addEventListener("DOMContentLoaded", () => {
  fetch("/header/header-student.html")
    .then((response) => response.text())
    .then((data) => {
      document.body.insertAdjacentHTML("afterbegin", data);
    });
});
