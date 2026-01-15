const year = document.getElementById("year");
if (year) year.textContent = new Date().getFullYear();

const menuBtn = document.getElementById("menuBtn");
const nav = document.getElementById("nav");

if (menuBtn && nav) {
  menuBtn.addEventListener("click", () => {
    nav.classList.toggle("open");
  });
}

