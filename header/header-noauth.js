document.addEventListener("DOMContentLoaded", () => {
  fetch("/header/header-noauth.html")
    .then((response) => response.text())
    .then((data) => {
      document.body.insertAdjacentHTML("afterbegin", data);
    });
});