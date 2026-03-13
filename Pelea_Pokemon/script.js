
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
            <a href="Poke-API.html">PokeAPI</a>
            <a href="extra2.html">Extra_2</a>
            <a href="#" onclick="logout(); return false;">Cerrar Sesión</a>
        `;
    } else if (pageType === 'Poke-API') {
        navLinks = `
            <a href="gato.html">Gato</a>
            <a href="extra2.html">Extra_2</a>
            <a href="#" onclick="logout(); return false;">Cerrar Sesión</a>
        `;
    } else if (pageType === 'extra2') {
        navLinks = `
            <a href="Poke-API.html">PokeAPI</a>
            <a href="gato.html">Gato</a>
            <a href="#" onclick="logout(); return false;">Cerrar Sesión</a>
        `;
    }
    
    // Se crean y se insertan el encabezado y pie de página en el documento
    createHeader(navLinks);
    createFooter();
}


// llama un pokemon por su id y muestra su nombre e imagen
async function fetchOnePokemon(nameOrId) {
    const q = String(nameOrId || "pikachu").trim().toLowerCase();
    const res = await fetch(`https://pokeapi.co/api/v2/pokemon/${encodeURIComponent(q)}`);
    if (!res.ok) throw new Error('Pokemon no encontrado');
    return res.json();
}

// obtiene Pokémon con paginación
async function fetchAllPokemonPaginated(offset = 0, limit = 25) {
    const res = await fetch(`https://pokeapi.co/api/v2/pokemon?limit=${limit}&offset=${offset}`);
    if (!res.ok) throw new Error('Error obteniendo lista de Pokémon');
    const data = await res.json();
    
    // Para cada Pokémon, obtener detalles
    const pokemonDetails = await Promise.all(
        data.results.map(async (pokemon) => {
            const detailRes = await fetch(pokemon.url);
            if (!detailRes.ok) throw new Error(`Error obteniendo detalles de ${pokemon.name}`);
            return await detailRes.json();
        })
    );
    
    return pokemonDetails;
}

// obtiene todos los Pokémon con detalles (mantiene compatibilidad)
async function fetchAllPokemon(limit = 75) {
    return await fetchAllPokemonPaginated(0, limit);
}

// muestra nombre + imagen del pokemon
function renderPokemonNameImage(data, container) {
    if (!container) return;
    const img = data.sprites?.front_default || data.sprites?.other?.['official-artwork']?.front_default || '';
    container.innerHTML = `
      <div style="text-align:center;">
      <h2 style="text-transform:capitalize;margin:.25rem 0">${data.name}</h2>
      ${img ? `<img src="${img}" alt="${data.name}" style="width:200px;height:200px;object-fit:contain;">` : '<p>No image</p>'}
    </div>
  `;
}

// renderiza tarjetas de Pokémon con stats
function renderPokemonCards(pokemonList) {
    const container = document.getElementById('pokemon-container');
    if (!container) return;
    
    container.innerHTML = ''; // Limpiar contenedor
    
    pokemonList.forEach(pokemon => {
        const card = document.createElement('div');
        card.className = 'pokemon-card';
        
        const img = pokemon.sprites?.front_default || '';
        const types = pokemon.types.map(t => t.type.name).join(', ');
        
        // Obtener stats principales
        const stats = pokemon.stats.slice(0, 3); // HP, ATK, DEF
        const statsHTML = stats.map(stat => `<p class="stat"><strong>${stat.stat.name.toUpperCase()}:</strong> ${stat.base_stat}</p>`).join('');
        
        // Obtener altura y peso
        const heightM = (pokemon.height / 10).toFixed(1);
        const weightKg = (pokemon.weight / 10).toFixed(1);
        
        card.innerHTML = `
            <h3>${pokemon.name.charAt(0).toUpperCase() + pokemon.name.slice(1)}</h3>
            <p class="pokemon-id">ID: ${pokemon.id}</p>
            <p class="pokemon-types"><strong>Tipos:</strong> ${types}</p>
            ${img ? `<img src="${img}" alt="${pokemon.name}">` : '<p>No image</p>'}
            <div class="pokemon-info">
                <p><strong>Altura:</strong> ${heightM}m</p>
                <p><strong>Peso:</strong> ${weightKg}kg</p>
                <div class="pokemon-stats">
                    ${statsHTML}
                </div>
            </div>
        `;
        
        container.appendChild(card);
    });
}

// configura los filtros con botones
function setupFilters() {
    // Los botones ahora usan onclick directo en el HTML
}

// carga todos los pokémon si es necesario para filtrar correctamente
async function loadAllPokemonForFiltering() {
    if (allPokemonLoaded) return; // Ya están todos cargados
    
    const container = document.getElementById('pokemon-container');
    const originalContent = container.innerHTML;
    container.textContent = 'Cargando todos los Pokémon para filtrar...';
    
    try {
        // Cargar todos los pokémon de una vez
        const allPokemonData = await fetchAllPokemonPaginated(0, totalPokemonAvailable);
        allPokemon = allPokemonData;
        allPokemonLoaded = true;
        pokemonOffset = totalPokemonAvailable; // Actualizar offset
        populateBattleSelectors();
        updateLoadMoreButton(); // Actualizar botón de cargar más
    } catch (error) {
        console.error('Error cargando todos los Pokémon:', error);
        container.innerHTML = originalContent;
        throw error;
    }
}

// aplica los filtros cuando se presiona el botón
async function applyFilters() {
    try {
        // Cargar todos los pokémon si no están cargados
        if (!allPokemonLoaded && allPokemon.length < totalPokemonAvailable) {
            await loadAllPokemonForFiltering();
        }
        
        const filterName = document.getElementById('filter-name');
        const filterId = document.getElementById('filter-id');
        const filterType = document.getElementById('filter-type');
        
        const nameFilter = filterName.value.toLowerCase().trim();
        const idFilter = filterId.value ? parseInt(filterId.value) : null;
        const typeFilter = filterType.value.toLowerCase().trim();
        
        // Filtrar todos los pokémon
        filteredPokemon = allPokemon.filter(pokemon => {
            const matchesName = !nameFilter || pokemon.name.toLowerCase().includes(nameFilter);
            const matchesId = !idFilter || pokemon.id === idFilter;
            const matchesType = !typeFilter || pokemon.types.some(t => t.type.name.toLowerCase().includes(typeFilter));
            return matchesName && matchesId && matchesType;
        });
        
        // Mostrar solo los primeros 25 resultados
        filteredOffset = 0;
        isFiltering = true;
        const displayPokemon = filteredPokemon.slice(0, pokemonLimit);
        renderPokemonCards(displayPokemon);
        updateLoadMoreButton();
        
        // Mostrar cantidad de resultados
        if (filteredPokemon.length === 0) {
            const container = document.getElementById('pokemon-container');
            container.innerHTML = '<p style="grid-column: 1 / -1; text-align: center; color: #fff;">No se encontraron Pokémon con esos criteria</p>';
        }
    } catch (error) {
        console.error('Error aplicando filtros:', error);
    }
}

// limpia todos los filtros
function clearFilters() {
    document.getElementById('filter-name').value = '';
    document.getElementById('filter-id').value = '';
    document.getElementById('filter-type').value = '';
    
    // Resetear modo filtro
    isFiltering = false;
    filteredPokemon = [];
    filteredOffset = 0;
    pokemonOffset = 0;
    
    // Mostrar solo los primeros 25 Pokémon normales
    renderPokemonCards(allPokemon.slice(0, pokemonLimit));
    updateLoadMoreButton();
}

// carga más Pokémon
async function loadMorePokemon() {
    try {
        const loadMoreBtn = document.getElementById('load-more-btn');
        loadMoreBtn.disabled = true;
        loadMoreBtn.textContent = 'Cargando...';
        
        if (isFiltering) {
            // Si está filtrando, cargar 25 más de los resultados filtrados
            filteredOffset += pokemonLimit;
            const displayPokemon = filteredPokemon.slice(0, filteredOffset + pokemonLimit);
            renderPokemonCards(displayPokemon);
        } else {
            // Si no está filtrando, cargar 25 más de todos los Pokémon
            pokemonOffset += pokemonLimit;
            const newPokemon = await fetchAllPokemonPaginated(pokemonOffset, pokemonLimit);
            allPokemon = allPokemon.concat(newPokemon);
            
            // Si ya tenemos todos, marcar como cargados
            if (allPokemon.length >= totalPokemonAvailable) {
                allPokemonLoaded = true;
            }
            
            renderPokemonCards(allPokemon);
            populateBattleSelectors();
        }
        
        updateLoadMoreButton();
        loadMoreBtn.disabled = false;
    } catch (error) {
        console.error('Error cargando más Pokémon:', error);
        const loadMoreBtn = document.getElementById('load-more-btn');
        loadMoreBtn.textContent = 'Error al cargar';
        loadMoreBtn.disabled = false;
    }
}

// actualiza el estado del botón de cargar más
function updateLoadMoreButton() {
    const loadMoreBtn = document.getElementById('load-more-btn');
    
    if (isFiltering) {
        // Si está filtrando, mostrar progreso de los resultados filtrados
        const displayedCount = Math.min(filteredOffset + pokemonLimit, filteredPokemon.length);
        
        if (displayedCount >= filteredPokemon.length) {
            loadMoreBtn.textContent = `Todos los resultados cargados (${filteredPokemon.length})`;
            loadMoreBtn.disabled = true;
        } else {
            loadMoreBtn.textContent = `Cargar más (${displayedCount}/${filteredPokemon.length})`;
            loadMoreBtn.disabled = false;
        }
    } else {
        // Si no está filtrando, mostrar progreso de todos los pokémon
        const loadedCount = allPokemon.length;
        
        if (loadedCount >= totalPokemonAvailable) {
            loadMoreBtn.textContent = 'Todos los Pokémon cargados';
            loadMoreBtn.disabled = true;
        } else {
            loadMoreBtn.textContent = `Cargar más Pokémon (${loadedCount}/${totalPokemonAvailable})`;
            loadMoreBtn.disabled = false;
        }
    }
}

//carga pagina
let allPokemon = []; // Array para almacenar todos los Pokémon con detalles
let pokemonOffset = 0; // Offset para la carga incremental
let pokemonLimit = 25; // Cantidad de Pokémon a cargar por vez
let totalPokemonAvailable = 0; // Total de Pokémon disponibles en la API
let allPokemonLoaded = false; // Indica si hemos cargado todos los Pokémon
let filteredPokemon = []; // Array para almacenar los resultados filtrados
let filteredOffset = 0; // Offset para los resultados filtrados
let isFiltering = false; // Indica si está activo un filtro

window.loadPokeAPI = async function() {
    const container = document.getElementById('pokemon-container');
    if (!container) return;
    container.textContent = 'Cargando Pokémon...';
    
    try {
        // Obtener el total de Pokémon disponibles
        const countRes = await fetch('https://pokeapi.co/api/v2/pokemon?limit=1');
        const countData = await countRes.json();
        totalPokemonAvailable = countData.count;
        
        // Cargar los primeros Pokémon
        pokemonOffset = 0;
        allPokemon = await fetchAllPokemonPaginated(pokemonOffset, pokemonLimit);
        renderPokemonCards(allPokemon);
        setupFilters();
        initializeBattleUI();
        updateLoadMoreButton();
    } catch (error) {
        container.textContent = 'Error cargando Pokémon';
        console.error(error);
    }
};

// -- Batalla de Pokémon --

function initializeBattleUI() {
    const selector1 = document.getElementById('battle-pokemon-1');
    const selector2 = document.getElementById('battle-pokemon-2');
    if (!selector1 || !selector2) return;
    populateBattleSelectors();

    // Agregar event listeners para actualizar imágenes
    selector1.addEventListener('change', updatePokemonImage);
    selector2.addEventListener('change', updatePokemonImage);
}

function updatePokemonImage(event) {
    const selector = event.target;
    const index = parseInt(selector.value, 10);
    const imageDiv = document.getElementById(selector.id.replace('battle-pokemon-', 'pokemon-') + '-image');
    if (!imageDiv || isNaN(index)) {
        imageDiv.innerHTML = '<span>Selecciona</span>';
        return;
    }
    const pokemon = allPokemon[index];
    const img = pokemon.sprites?.other?.['official-artwork']?.front_default || pokemon.sprites?.front_default || '';
    const types = pokemon.types.map(t => t.type.name).join(', ');
    imageDiv.innerHTML = `
        <h3>${pokemon.name.charAt(0).toUpperCase() + pokemon.name.slice(1)}</h3>
        <p class="pokemon-id">ID: ${pokemon.id}</p>
        <p class="pokemon-types"><strong>Tipos:</strong> ${types}</p>
        ${img ? `<img src="${img}" alt="${pokemon.name}">` : '<p>No image</p>'}
    `;
}

function populateBattleSelectors() {
    const selector1 = document.getElementById('battle-pokemon-1');
    const selector2 = document.getElementById('battle-pokemon-2');
    if (!selector1 || !selector2) return;

    const prev1 = selector1.value;
    const prev2 = selector2.value;

    selector1.innerHTML = '<option value="">--Seleccione--</option>';
    selector2.innerHTML = '<option value="">--Seleccione--</option>';

    // Usamos los primeros 150 Pokémon para no saturar el selector
    allPokemon.slice(0, 150).forEach((pokemon, index) => {
        const name = pokemon.name.charAt(0).toUpperCase() + pokemon.name.slice(1);
        const option = `<option value="${index}">${name} (ID ${pokemon.id})</option>`;
        selector1.insertAdjacentHTML('beforeend', option);
        selector2.insertAdjacentHTML('beforeend', option);
    });

    if (prev1) selector1.value = prev1;
    if (prev2) selector2.value = prev2;
}

function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

function appendBattleLog(message, isHighlight = false) {
    const log = document.getElementById('battle-log');
    if (!log) return;
    const p = document.createElement('p');
    p.textContent = message;
    if (isHighlight) p.style.fontWeight = 'bold';
    log.appendChild(p);
    log.scrollTop = log.scrollHeight;
}

function flashPokemon(pokemonDivId, color) {
    const div = document.getElementById(pokemonDivId);
    if (!div) return;
    const className = 'flash-' + color;
    div.classList.add(className);
    setTimeout(() => {
        div.classList.remove(className);
    }, 500);
}

function buildBattlePokemon(pokemon) {
    const statsMap = (pokemon.stats || []).reduce((acc, stat) => {
        acc[stat.stat.name] = stat.base_stat;
        return acc;
    }, {});

    const image = pokemon.sprites?.front_default || '';
    const types = (pokemon.types || []).map(t => t.type.name);
    return {
        name: pokemon.name,
        displayName: pokemon.name.charAt(0).toUpperCase() + pokemon.name.slice(1),
        img: image,
        types: types,
        maxHp: 100,  // HP fijo para todos
        currentHp: 100,
        attack: 50,  // Ataque fijo
        defense: 50, // Defensa fija
        spAttack: 50, // Ataque especial fijo
        spDefense: 50, // Defensa especial fija
        speed: 50,   // Velocidad fija
        specialAttackCd: 3,
        specialDefenseCd: 3,  // Cambiado a 3 para que sea después del 3er turno
        defendActive: false,
    };
}

function formatPercent(current, max) {
    return Math.max(0, Math.round((current / max) * 100));
}

function showBattleResult(winner) {
    console.log('Mostrando resultado de batalla para', winner.displayName, 'con imagen:', winner.img);
    const result = document.getElementById('battle-result');
    const selectors = document.querySelector('.battle-selectors');
    if (!result || !selectors) {
        console.error('No se encontró battle-result o battle-selectors');
        return;
    }

    // Ocultar selectores
    selectors.style.display = 'none';

    // Mostrar imagen del ganador arriba con botón para elegir de nuevo
    result.innerHTML = `
        <h2>¡Ganador: ${winner.displayName}!</h2>
        ${winner.img ? `<img src="${winner.img}" alt="${winner.displayName}">` : '<p>No hay imagen disponible</p>'}
        <button id="choose-again-btn" onclick="resetBattle()">Reiniciar Batalla</button>
    `;
}

function resetBattle() {
    const result = document.getElementById('battle-result');
    const selectors = document.querySelector('.battle-selectors');
    const log = document.getElementById('battle-log');
    if (!result || !selectors || !log) return;

    // Limpiar resultado y log
    result.innerHTML = '';
    log.innerHTML = 'Seleccione dos pokémon y presione "Iniciar Batalla".';

    // Mostrar selectores
    selectors.style.display = 'flex';
}

function computeDamage(attacker, defender, isSpecial) {
    const baseAttack = isSpecial ? attacker.spAttack : attacker.attack;
    const randomFactor = 0.9 + Math.random() * 0.2; // +-10%
    let raw = (baseAttack * (isSpecial ? 1.5 : 1)) - (defender.defense * 0.6);
    let damage = Math.max(5, Math.round(raw * randomFactor));

    // Ventajas de tipo: +30% daño si el atacante tiene ventaja sobre el defensor
    const typeAdvantages = {
        fire: ['grass', 'bug', 'ice', 'steel'],
        water: ['fire', 'ground', 'rock'],
        grass: ['water', 'ground', 'rock'],
        electric: ['water', 'flying'],
        ground: ['electric', 'rock', 'poison'],
        flying: ['grass', 'fighting', 'bug'],
        psychic: ['fighting', 'poison'],
        bug: ['grass', 'psychic', 'dark'],
        rock: ['flying', 'bug', 'fire', 'ice'],
        ghost: ['psychic', 'ghost'],
        dragon: ['dragon'],
        dark: ['psychic', 'ghost'],
        steel: ['ice', 'rock', 'fairy'],
        fairy: ['dragon', 'dark', 'fighting'],
        ice: ['grass', 'ground', 'flying', 'dragon'],
        poison: ['grass', 'fairy'],
        fighting: ['normal', 'rock', 'steel', 'ice', 'dark']
    };

    let hasAdvantage = false;
    for (const attType of attacker.types) {
        if (typeAdvantages[attType] && typeAdvantages[attType].some(defType => defender.types.includes(defType))) {
            hasAdvantage = true;
            break;
        }
    }
    if (hasAdvantage) {
        damage = Math.round(damage * 1.3);
    }

    if (defender.defendActive) {
        damage = Math.round(damage * 0.5);
        defender.defendActive = false;
    }

    return Math.max(1, damage);
}

async function startBattle() {
    const selector1 = document.getElementById('battle-pokemon-1');
    const selector2 = document.getElementById('battle-pokemon-2');
    const result = document.getElementById('battle-result');
    const log = document.getElementById('battle-log');
    const selectors = document.querySelector('.battle-selectors');

    if (!selector1 || !selector2 || !log || !result || !selectors) return;

    // Mostrar selectores y limpiar resultado
    selectors.style.display = 'flex';
    result.innerHTML = '';
    log.innerHTML = '';

    const idx1 = parseInt(selector1.value, 10);
    const idx2 = parseInt(selector2.value, 10);

    if (isNaN(idx1) || isNaN(idx2)) {
        log.textContent = 'Selecciona dos pokémon para iniciar la batalla.';
        return;
    }

    if (idx1 === idx2) {
        log.textContent = 'Elige dos pokémon distintos para pelear.';
        return;
    }

    const p1 = buildBattlePokemon(allPokemon[idx1]);
    const p2 = buildBattlePokemon(allPokemon[idx2]);

    // El que tiene mayor velocidad inicia
    let attacker = p1;
    let defender = p2;
    if (p2.speed > p1.speed || (p2.speed === p1.speed && Math.random() < 0.5)) {
        attacker = p2;
        defender = p1;
    }

    appendBattleLog(`Comienza la batalla: ${p1.displayName} vs ${p2.displayName}`);
    appendBattleLog(`${attacker.displayName} ataca primero (mayor velocidad).`, true);

    const startBtn = document.getElementById('start-battle-btn');
    if (startBtn) startBtn.disabled = true;

    let turn = 1;
    const maxTurns = 100;
    while (attacker.currentHp > 0 && defender.currentHp > 0 && turn <= maxTurns) {
        await sleep(700);
        appendBattleLog(`--- Turno ${turn}: ${attacker.displayName} ---`, true);

        // Reducir cooldowns al inicio del turno
        if (attacker.specialAttackCd > 0) attacker.specialAttackCd -= 1;
        if (attacker.specialDefenseCd > 0) attacker.specialDefenseCd -= 1;

        const canUseSpecialAttack = attacker.specialAttackCd <= 0;
        const canUseSpecialDefense = attacker.specialDefenseCd <= 0;

        // Decidir acción: defensa especial > ataque especial > ataque normal
        const roll = Math.random();
        let action = 'attack';
        if (canUseSpecialDefense && roll < 0.2) {
            action = 'special-defense';
        } else if (canUseSpecialAttack && roll < 0.6) {
            action = 'special-attack';
        }

        if (action === 'special-defense') {
            const success = Math.random() < 0.8;
            if (success) {
                attacker.defendActive = true;
                attacker.specialDefenseCd = 2;
                appendBattleLog(`${attacker.displayName} activa Defensa Especial (reduce próximo daño).`);
                // Flash azul para el atacante (defensa)
                flashPokemon(attacker === p1 ? 'pokemon-1-image' : 'pokemon-2-image', 'blue');
            } else {
                appendBattleLog(`${attacker.displayName} intenta Defensa Especial pero falla.`);
            }
        } else {
            const hit = Math.random() < 0.85;
            if (!hit) {
                appendBattleLog(`${attacker.displayName} ataca pero falla el golpe.`);
            } else {
                const isSpecial = action === 'special-attack';
                const damage = computeDamage(attacker, defender, isSpecial);

                if (isSpecial) {
                    attacker.specialAttackCd = 3;
                    appendBattleLog(`${attacker.displayName} usa Ataque Especial y causa ${damage} de daño.`);
                } else {
                    appendBattleLog(`${attacker.displayName} usa Ataque y causa ${damage} de daño.`);
                }

                defender.currentHp = Math.max(0, defender.currentHp - damage);
                const defenderLife = formatPercent(defender.currentHp, defender.maxHp);
                appendBattleLog(`${defender.displayName} queda con ${defenderLife}% de vida.`);

                // Flash rojo para el defensor (daño)
                flashPokemon(defender === p1 ? 'pokemon-1-image' : 'pokemon-2-image', 'red');
            }
        }

        if (defender.currentHp <= 0) break;

        // Intercambiar roles para el siguiente turno
        [attacker, defender] = [defender, attacker];
        turn += 1;
    }

    let winner;
    if (turn > maxTurns) {
        appendBattleLog('La batalla terminó en empate por límite de turnos.', true);
        winner = p1.currentHp > p2.currentHp ? p1 : p2; // Elegir el que tenga más HP
    } else {
        winner = attacker.currentHp > 0 ? attacker : defender;
    }
    appendBattleLog(`¡${winner.displayName} gana la batalla!`, true);
    console.log('Batalla terminada, ganador:', winner.displayName, 'HP:', winner.currentHp, 'Imagen:', winner.img);
    showBattleResult(winner);

    if (startBtn) startBtn.disabled = false;
}
