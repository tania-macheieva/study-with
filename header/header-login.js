document.addEventListener("DOMContentLoaded", () => {
    fetch("/header/header-login.html")
      .then((response) => response.text())
      .then((data) => {
        document.body.insertAdjacentHTML("afterbegin", data);
      });
  });