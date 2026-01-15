document.getElementById("loginForm").addEventListener("submit", function (e) {
    e.preventDefault();

    let email = document.getElementById("email").value.trim();
    let password = document.getElementById("password").value.trim();

    if (!email || !password) {
        alert("Completa todos los campos.");
        return;
    }

    if (!email.includes("@") || !email.includes(".")) {
        alert("Correo inválido.");
        return;
    }

    if (password.length < 6) {
        alert("La contraseña debe tener mínimo 6 caracteres.");
        return;
    }

    alert("Inicio de sesión exitoso (simulado).");
});
