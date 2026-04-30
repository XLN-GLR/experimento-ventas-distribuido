// Obtener credenciales desde un objeto global CONFIG (provisto por config.js) o variables de entorno
const SUPABASE_URL = (typeof CONFIG !== 'undefined' && CONFIG.SUPABASE_URL) || (window.ENV && window.ENV.SUPABASE_URL) || '';
const SUPABASE_ANON_KEY = (typeof CONFIG !== 'undefined' && CONFIG.SUPABASE_ANON_KEY) || (window.ENV && window.ENV.SUPABASE_ANON_KEY) || '';

if (!window.supabaseClient) {
    if (!SUPABASE_URL || !SUPABASE_ANON_KEY || SUPABASE_URL.includes('TU_SUPABASE_URL')) {
        console.error('⚠️ [Error Crítico]: Las credenciales de Supabase no están definidas o son las predeterminadas.');
    } else if (typeof window.supabase !== 'undefined') {
        let finalUrl = SUPABASE_URL;
        let isSanitized = false;
        
        if (finalUrl.includes('/rest/v1')) {
            finalUrl = finalUrl.replace('/rest/v1', '');
            isSanitized = true;
        }
        
        window.supabaseClient = window.supabase.createClient(finalUrl, SUPABASE_ANON_KEY);
        
        if (isSanitized) {
            console.log("URL sanitizada y cliente inicializado");
        } else {
            console.log("Supabase inicializado correctamente");
        }
    }
}

const supabaseClient = window.supabaseClient;

// Estado global de la aplicación
let currentProducts = [];
let editingProductId = null;

/**
 * Muestra una notificación temporal en la interfaz (UI descriptiva para errores/éxitos)
 */
function showNotification(mensaje, tipo = 'error') {
    const div = document.createElement('div');
    div.className = `notificacion ${tipo}`;
    div.textContent = mensaje;
    document.body.appendChild(div);
    
    // Animar entrada
    requestAnimationFrame(() => div.classList.add('visible'));
    
    // Remover después de 3.5 segundos
    setTimeout(() => {
        div.classList.remove('visible');
        setTimeout(() => div.remove(), 300); // Esperar a que termine la transición css
    }, 3500);
}

/**
 * Función para verificar el estado de la sesión usando getUser
 */
async function handle_session_state() {
    try {
        const { data: { user }, error } = await supabaseClient.auth.getUser();
        
        const authPanel = document.getElementById('auth-panel');
        const appPanel = document.getElementById('app-panel');

        if (user) {
            authPanel.style.display = 'none';
            appPanel.style.display = 'block';
            cargarProductos();
        } else {
            authPanel.style.display = 'block';
            appPanel.style.display = 'none';
        }
    } catch (error) {
        console.error('Error verificando sesión:', error.message);
        const authPanel = document.getElementById('auth-panel');
        const appPanel = document.getElementById('app-panel');
        authPanel.style.display = 'block';
        appPanel.style.display = 'none';
    }
}

/**
 * Función asíncrona para iniciar sesión
 */
async function iniciarSesion(event) {
    event.preventDefault();
    console.log("Intentando iniciar sesión...");
    
    const email = document.getElementById('user-email').value;
    const password = document.getElementById('user-password').value;
    const btnSubmit = document.getElementById('btn-login');
    const textoOriginal = btnSubmit.textContent;
    
    btnSubmit.textContent = 'Iniciando sesión...';
    btnSubmit.disabled = true;

    try {
        console.log("Valores capturados - Email:", email, "Password:", password);
        const { error } = await supabaseClient.auth.signInWithPassword({
            email: email,
            password: password
        });

        if (error) throw error;
        
        event.target.reset();
        
        // Manipulación explícita de estilos en línea tras éxito de inicio de sesión
        document.getElementById('auth-panel').style.display = 'none';
        document.getElementById('app-panel').style.display = 'block';
        
        await handle_session_state();
    } catch (error) {
        console.error('Error al iniciar sesión:', error.message);
        alert('Los datos de acceso son erróneos o inexistentes.');
    } finally {
        btnSubmit.textContent = textoOriginal;
        btnSubmit.disabled = false;
    }
}

/**
 * Función asíncrona para cerrar sesión
 */
async function execute_user_logout() {
    try {
        const { error } = await supabaseClient.auth.signOut();
        if (error) throw error;
        
        currentProducts = [];
        editingProductId = null;
        document.getElementById('productos-contenedor').innerHTML = '<div class="cargando">Cargando productos...</div>';
        
        await handle_session_state();
    } catch (error) {
        console.error('Error al cerrar sesión:', error.message);
        showNotification('Ocurrió un error al intentar cerrar la sesión. La base de datos no responde.', 'error');
    }
}

/**
 * Función asíncrona para hacer un SELECT a la tabla "productos"
 */
async function cargarProductos() {
    const contenedor = document.getElementById('productos-contenedor');
    
    try {
        const { data: productos, error } = await supabaseClient
            .from('productos')
            .select('*');

        if (error) throw error;

        currentProducts = productos || [];
        renderizarProductos(currentProducts);
    } catch (error) {
        console.error('Error al cargar los productos:', error.message);
        contenedor.innerHTML = '<div class="empty-state">Ocurrió un error al cargar el inventario.</div>';
        showNotification('La base de datos no responde. Imposible cargar los productos.', 'error');
    }
}

function renderizarProductos(productos) {
    const contenedor = document.getElementById('productos-contenedor');
    contenedor.innerHTML = ''; 
    
    if (!productos || productos.length === 0) {
        contenedor.innerHTML = '<div class="empty-state">No hay productos disponibles por el momento.</div>';
        return;
    }

    const lista = document.createElement('div');
    lista.className = 'productos-grid';

    productos.forEach(producto => {
        const card = document.createElement('div');
        card.className = 'producto-card';
        
        const precioFormateado = producto.precio !== undefined 
            ? new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN' }).format(producto.precio) 
            : '$0.00';

        card.innerHTML = `
            ${producto.imagen_url 
                ? `<img src="${producto.imagen_url}" alt="${producto.nombre || 'Producto'}" class="producto-imagen" loading="lazy">` 
                : '<div class="producto-imagen-placeholder"></div>'
            }
            <div class="producto-info">
                <h3 class="producto-nombre">${producto.nombre || 'Producto sin nombre'}</h3>
                <p class="producto-descripcion">${producto.descripcion || ''}</p>
                <div class="producto-precio">${precioFormateado}</div>
                <div class="producto-acciones">
                    <button class="btn-editar" data-id="${producto.id}">Editar</button>
                    <button class="btn-eliminar" data-id="${producto.id}">Eliminar</button>
                </div>
            </div>
        `;

        const btnEditar = card.querySelector('.btn-editar');
        const btnEliminar = card.querySelector('.btn-eliminar');
        
        btnEditar.addEventListener('click', () => prepare_edit_mode(producto.id));
        btnEliminar.addEventListener('click', () => remove_inventory_item(producto.id));

        lista.appendChild(card);
    });

    contenedor.appendChild(lista);
}

function prepare_edit_mode(id) {
    const producto = currentProducts.find(p => p.id === id);
    if (!producto) return;

    editingProductId = id;

    document.getElementById('product-name').value = producto.nombre || '';
    document.getElementById('product-price').value = producto.precio || '';
    document.getElementById('product-stock').value = producto.stock || '';

    document.querySelector('#add-product-form h2').textContent = 'Editar Producto';
    document.querySelector('#add-product-form .btn-submit').textContent = 'Actualizar Producto';

    document.getElementById('product-name').focus();
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

async function remove_inventory_item(id) {
    const confirmacion = confirm("¿Estás seguro de que deseas eliminar este producto permanentemente?");
    if (!confirmacion) return;

    try {
        const { error } = await supabaseClient
            .from('productos')
            .delete()
            .eq('id', id);

        if (error) throw error;

        await cargarProductos();
        showNotification('Producto eliminado exitosamente.', 'success');
    } catch (error) {
        console.error('Error al eliminar:', error.message);
        showNotification('No se pudo eliminar el producto. La base de datos no responde.', 'error');
    }
}

async function send_product_to_cloud(event) {
    event.preventDefault(); 

    const nombre = document.getElementById('product-name').value;
    const precio = parseFloat(document.getElementById('product-price').value);
    const stock = parseInt(document.getElementById('product-stock').value, 10);

    const btnSubmit = event.target.querySelector('.btn-submit');
    const textoOriginal = btnSubmit.textContent;
    btnSubmit.textContent = 'Guardando...';
    btnSubmit.disabled = true;

    try {
        let errorResult;

        if (editingProductId) {
            const { error } = await supabaseClient
                .from('productos')
                .update({ nombre, precio, stock })
                .eq('id', editingProductId);
            errorResult = error;
        } else {
            const { error } = await supabaseClient
                .from('productos')
                .insert([{ nombre, precio, stock }]);
            errorResult = error;
        }

        if (errorResult) throw errorResult;

        event.target.reset();
        
        let mensajeExito = editingProductId ? 'Producto actualizado correctamente.' : 'Producto creado correctamente.';
        editingProductId = null;
        document.querySelector('#add-product-form h2').textContent = 'Añadir Nuevo Producto';
        
        await cargarProductos();
        showNotification(mensajeExito, 'success');
    } catch (error) {
        console.error('Error al guardar el producto:', error.message);
        showNotification('Error al guardar. La base de datos no responde o los datos son inválidos.', 'error');
    } finally {
        btnSubmit.textContent = editingProductId ? 'Actualizar Producto' : 'Guardar Producto';
        btnSubmit.disabled = false;
    }
}

document.addEventListener('DOMContentLoaded', () => {
    if (!supabaseClient) {
        document.body.innerHTML = `
            <div class="container">
                <div class="error" style="margin-top: 3rem; text-align: center;">
                    <h2 style="margin-top:0;">⚠️ Error de Configuración</h2>
                    <p>Las credenciales de Supabase no están configuradas correctamente o falta el archivo <strong>config.js</strong>.</p>
                </div>
            </div>`;
        return; 
    }

    handle_session_state();
    
    supabaseClient.auth.onAuthStateChange((event, session) => {
        if (event === 'SIGNED_IN' || event === 'SIGNED_OUT') {
            handle_session_state();
        }
    });
    
    const formProducto = document.getElementById('add-product-form');
    if (formProducto) formProducto.addEventListener('submit', send_product_to_cloud);
    
    const formLogin = document.getElementById('login-form');
    if (formLogin) formLogin.addEventListener('submit', iniciarSesion);
    
    const btnLogout = document.getElementById('btn-logout');
    if (btnLogout) btnLogout.addEventListener('click', execute_user_logout);
});
