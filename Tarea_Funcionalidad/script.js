
// va a registro
function goToRegister() {
    window.location.href = "register.html";
}

// Helpers: users stored as JSON array under 'users'
function getUsers() {
    const raw = localStorage.getItem('users');
    return raw ? JSON.parse(raw) : [];
}

function saveUsers(users) {
    localStorage.setItem('users', JSON.stringify(users));
}

async function hashPassword(password) {
    const enc = new TextEncoder();
    const data = enc.encode(password);
    const hashBuffer = await crypto.subtle.digest('SHA-256', data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

// registro
async function createAccount() {
    const Usuario = document.getElementById('NewUsuario').value.trim();
    const Contraseña = document.getElementById('NewContraseña').value;
    const Confirm = document.getElementById('NewConfirmContraseña') ? document.getElementById('NewConfirmContraseña').value : '';
    const mensajeEl = document.getElementById('mensaje');

    mensajeEl.textContent = '';

    if (!Usuario || !Contraseña || !Confirm) {
        mensajeEl.textContent = 'Llena todos los campos';
        return;
    }

    if (Contraseña !== Confirm) {
        mensajeEl.textContent = 'Las contraseñas no coinciden';
        return;
    }

    const users = getUsers();
    if (users.some(u => u.username === Usuario)) {
        mensajeEl.textContent = 'El usuario ya existe';
        return;
    }

    const hash = await hashPassword(Contraseña);
    users.push({ username: Usuario, passwordHash: hash });
    saveUsers(users);

    console.log('Nuevo usuario creado:', { username: Usuario });
    alert('Cuenta creada correctamente');
    window.location.href = 'index.html';
}

// login
async function login() {
    const Usuario = document.getElementById('usuario-correo').value.trim();
    const Contraseña = document.getElementById('contraseña').value;
    const mensajeEl = document.getElementById('mensaje');

    mensajeEl.textContent = '';

    const users = getUsers();
    const user = users.find(u => u.username === Usuario);
    if (!user) {
        mensajeEl.textContent = 'Usuario o contraseña incorrectos.';
        return;
    }

    const hash = await hashPassword(Contraseña);
    if (hash === user.passwordHash) {
        localStorage.setItem('currentUser', Usuario);
        localStorage.setItem('isLoggedIn', 'true');
        window.location.href = 'gato.html';
    } else {
        mensajeEl.textContent = 'Usuario o contraseña incorrectos.';
    }
}

// cerrar sesion
function logout() {
    localStorage.removeItem('currentUser');
    localStorage.removeItem('isLoggedIn');
    window.location.href = 'index.html';
}

function isAuthenticated() {
    return localStorage.getItem('isLoggedIn') === 'true';
}

function checkAuth() {
    if (document.body.dataset.protected === 'true' && !isAuthenticated()) {
        window.location.href = 'index.html';
    }
}

window.addEventListener('DOMContentLoaded', checkAuth);