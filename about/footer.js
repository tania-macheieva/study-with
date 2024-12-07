document.addEventListener("DOMContentLoaded", () => {
  fetch("footer.html")
    .then((response) => {
      if (!response.ok) {
        throw new Error("Failed to load footer: " + response.statusText);
      }
      return response.text();
    })
    .then((data) => {
      document.querySelector(".footer").insertAdjacentHTML("beforeend", data);
    })
    .catch((error) => {
      console.error("Error loading footer:", error);
    });
});
