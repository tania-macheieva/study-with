document.addEventListener("DOMContentLoaded", () => {
  const link = document.createElement("link");
  link.rel = "stylesheet";
  link.href = "./preloader.css"; 
  document.head.appendChild(link);

  const preloaderHTML = `
    <div id="preloader" class="preloader">
      <div class="three-body">
        <div class="three-body__dot"></div>
        <div class="three-body__dot"></div>
        <div class="three-body__dot"></div>
      </div>
    </div>
  `;
  document.body.insertAdjacentHTML("afterbegin", preloaderHTML);
});

window.addEventListener("load", () => {
  setTimeout(() => {
    const preloader = document.getElementById("preloader");
    if (preloader) {
      preloader.classList.add("hidden");
      setTimeout(() => preloader.remove(), 300);
    }
  }, 200); 
});
