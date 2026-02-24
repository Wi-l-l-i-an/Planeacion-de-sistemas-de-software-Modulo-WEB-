
// Esta función redirecciona al usuario hacia la página de registro
// Se encarga de cambiar la ubicación del navegador a la página register.html
function goToRegister() {
    window.location.href = "register.html";
}

// Funciones auxiliares: Los usuarios se almacenan como un arreglo JSON bajo la clave 'users'
// Esta función recupera la lista de usuarios almacenados en el localStorage del navegador
function getUsers() {
    const raw = localStorage.getItem('users');
    return raw ? JSON.parse(raw) : [];
}

// Esta función se encarga de guardar la lista de usuarios en el localStorage del navegador
// Convierte el arreglo de usuarios a formato JSON y lo almacena
function saveUsers(users) {
    localStorage.setItem('users', JSON.stringify(users));
}

// Esta función se encarga de encriptar la contraseña utilizando el algoritmo SHA-256
// Recibe la contraseña en texto plano y retorna una cadena hexadecimal que representa el hash
// Se utiliza la API Web Crypto para asegurar las contraseñas en el almacenamiento local
async function hashPassword(password) {
    const enc = new TextEncoder();
    const data = enc.encode(password);
    const hashBuffer = await crypto.subtle.digest('SHA-256', data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

// Esta función se encarga de crear una nueva cuenta de usuario
// Se valida que todos los campos estén completos, que las contraseñas coincidan
// y que el usuario no exista previamente. Luego se encripta la contraseña y se guarda el usuario
async function createAccount() {
    const Usuario = document.getElementById('NewUsuario').value.trim();
    const Contraseña = document.getElementById('NewContraseña').value;
    const Confirm = document.getElementById('NewConfirmContraseña') ? document.getElementById('NewConfirmContraseña').value : '';
    const mensajeEl = document.getElementById('mensaje');

    mensajeEl.textContent = '';

    // Se valida que todos los campos obligatorios sean completados por el usuario
    if (!Usuario || !Contraseña || !Confirm) {
        mensajeEl.textContent = 'Llena todos los campos';
        return;
    }

    // Se verifica que ambas contraseñas ingresadas sean idénticas
    if (Contraseña !== Confirm) {
        mensajeEl.textContent = 'Las contraseñas no coinciden';
        return;
    }

    // Se obtiene la lista de usuarios registrados y se verifica si el usuario ya existe
    const users = getUsers();
    if (users.some(u => u.username === Usuario)) {
        mensajeEl.textContent = 'El usuario ya existe';
        return;
    }

    // Se encripta la contraseña y se agrega el nuevo usuario a la lista
    const hash = await hashPassword(Contraseña);
    users.push({ username: Usuario, passwordHash: hash });
    saveUsers(users);

    console.log('Nuevo usuario creado:', { username: Usuario });
    alert('Cuenta creada correctamente');
    window.location.href = 'index.html';
}

// Esta función se encarga de autenticar al usuario verificando sus credenciales
// Se busca el usuario en la lista registrada y se compara la contraseña ingresada
// con la contraseña encriptada almacenada. Si son correctas, se inicia la sesión
async function login() {
    const Usuario = document.getElementById('usuario-correo').value.trim();
    const Contraseña = document.getElementById('contraseña').value;
    const mensajeEl = document.getElementById('mensaje');

    mensajeEl.textContent = '';

    // Se obtiene la lista de usuarios y se busca si el usuario ingresado existe
    const users = getUsers();
    const user = users.find(u => u.username === Usuario);
    if (!user) {
        mensajeEl.textContent = 'Usuario o contraseña incorrectos.';
        return;
    }

    // Se encripta la contraseña ingresada y se compara con el hash almacenado
    const hash = await hashPassword(Contraseña);
    if (hash === user.passwordHash) {
        // Si las credenciales son correctas, se almacenan los datos de sesión
        localStorage.setItem('currentUser', Usuario);
        localStorage.setItem('isLoggedIn', 'true');
        window.location.href = 'gato.html';
    } else {
        mensajeEl.textContent = 'Usuario o contraseña incorrectos.';
    }
}

// Esta función se encarga de cerrar la sesión del usuario actual
// Elimina los datos de autenticación del almacenamiento local y redirecciona a la página de login
function logout() {
    localStorage.removeItem('currentUser');
    localStorage.removeItem('isLoggedIn');
    window.location.href = 'index.html';
}

// Esta función verifica si el usuario tiene una sesión activa
// Retorna verdadero si el indicador 'isLoggedIn' está establecido en el almacenamiento local
function isAuthenticated() {
    return localStorage.getItem('isLoggedIn') === 'true';
}

// Esta función valida la autenticación del usuario en páginas protegidas
// Si la página requiere autenticación y el usuario no está autenticado, se redirecciona al login
function checkAuth() {
    if (document.body.dataset.protected === 'true' && !isAuthenticated()) {
        window.location.href = 'index.html';
    }
}

// Se ejecuta el proceso de validación de autenticación cuando el documento está completamente cargado
window.addEventListener('DOMContentLoaded', checkAuth);

// Encabezado y pie de página comunes para todas las páginas de la aplicación

// Esta función crea el encabezado de la página con el título y navegación especificada
// Inserta el encabezado al inicio del cuerpo del documento HTML
function createHeader(navLinks) {
    const header = document.createElement('header');
    header.innerHTML = `
        <h1>Mi Aplicación</h1>
        <nav>${navLinks}</nav>
    `;
    document.body.insertBefore(header, document.body.firstChild);
}

// Esta función crea el pie de página de la aplicación con información de derechos de autor
// El pie de página se inserta al final del cuerpo del documento HTML
function createFooter() {
    const footer = document.createElement('footer');
    footer.innerHTML = `<p>&copy; Mi App - A00840101 - Willian Salomon Lemus Sanchez.</p>`;
    document.body.appendChild(footer);
}

// Esta función se encarga de inicializar la estructura de la página según su tipo
// Elimina encabezados y pies de página existentes, y luego crea nuevos adaptados al tipo de página
// El tipo de página determina qué enlaces de navegación se mostrarán
function initializePageLayout(pageType) {
    // Se eliminan los encabezados y pies de página existentes si están presentes
    const existingHeader = document.querySelector('header');
    const existingFooter = document.querySelector('footer');
    if (existingHeader) existingHeader.remove();
    if (existingFooter) existingFooter.remove();

    // Se crean los enlaces de navegación apropiados según el tipo de página
    let navLinks = '';
    
    // Se determina el contenido de navegación basado en el tipo de página
    if (pageType === 'login' || pageType === 'register') {
        navLinks = `
            <a href="index.html">Login</a>
            <a href="register.html">Registrarse</a>
        `;
    } else if (pageType === 'gato') {
        navLinks = `
            <a href="extra1.html">Extra_1</a>
            <a href="extra2.html">Extra_2</a>
            <a href="#" onclick="logout(); return false;">Cerrar Sesión</a>
        `;
    } else if (pageType === 'extra1') {
        navLinks = `
            <a href="gato.html">Gato</a>
            <a href="extra2.html">Extra_2</a>
            <a href="#" onclick="logout(); return false;">Cerrar Sesión</a>
        `;
    } else if (pageType === 'extra2') {
        navLinks = `
            <a href="extra1.html">Extra_1</a>
            <a href="gato.html">Gato</a>
            <a href="#" onclick="logout(); return false;">Cerrar Sesión</a>
        `;
    }
    
    // Se crean y se insertan el encabezado y pie de página en el documento
    createHeader(navLinks);
    createFooter();
}
