let timeout;
let hasShownPixelCat = false;

function showPixelCat() {
    if (hasShownPixelCat) return;

    const pixelCat = document.getElementById('pixel-cat');
    pixelCat.style.opacity = "1";
    pixelCat.style.bottom = "100%";
    hasShownPixelCat = true;

    setTimeout(() => {
        pixelCat.style.opacity = "0";
        pixelCat.style.bottom = "-100px";
    }, 1500000);
}

function resetTimer() {
    if (hasShownPixelCat) return;

    clearTimeout(timeout);
    timeout = setTimeout(showPixelCat, 1500000);
}

window.addEventListener("mousemove", resetTimer);
window.addEventListener("keydown", resetTimer);
window.addEventListener("scroll", resetTimer);

resetTimer();