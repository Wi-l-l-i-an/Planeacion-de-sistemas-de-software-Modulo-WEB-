
// va a registro

function goToRegister() {
    window.location.href = "register.html";
}

// registro
function createAccount() {
    const Usuario = document.getElementById('NewUsuario').value;
    const Contraseña = document.getElementById('NewContraseña').value;

    if (Usuario === "" || Contraseña === "") {
        document.getElementById("mensaje").textContent = "Llena todo los campos";
        return;
    }

    localStorage.setItem("usuario", Usuario);
    localStorage.setItem("contraseña", Contraseña);

    alert("Cuenta creada correctamente");
    window.location.href = "index.html";
}

//login

function login() {
    const Usuario = document.getElementById('usuario-correo').value;
    const Contraseña = document.getElementById('contraseña').value;

    const usuarioGuardado = localStorage.getItem("usuario");
    const contraseñaGuardada = localStorage.getItem("contraseña");


    if (Usuario === usuarioGuardado && Contraseña === contraseñaGuardada) {
        window.location.href = "gato.html";
    } else {
        document.getElementById("mensaje").textContent = "Usuario o contraseña incorrectos.";
    }
}

//cerrar sesion
function logout() {
    window.location.href = "index.html";
}