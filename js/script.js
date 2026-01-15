document.getElementById("loginForm").addEventListener("submit", function(e) {

    e.preventDefault();

    let email = document.getElementById("email").value.trim();
    let password = document.getElementById("password").value.trim();

    if (email === "" || password === "") {
        alert("Por favor completa todos los campos.");
        return;
    }

    if (!email.includes("@") || !email.includes(".")) {
        alert("Ingresa un correo válido.");
        return;
    }

    if (password.length < 6) {
        alert("La contraseña debe tener al menos 6 caracteres.");
        return;
    }

    alert("Inicio de sesión exitoso (simulado).");
});
