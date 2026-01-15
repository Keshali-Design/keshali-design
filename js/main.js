document.getElementById("year").textContent = new Date().getFullYear();

// Menú móvil
const nav = document.getElementById("nav");
const toggle = document.getElementById("navToggle");

toggle.addEventListener("click", () => nav.classList.toggle("open"));
