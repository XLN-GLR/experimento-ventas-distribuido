// Configuración de Supabase centralizada
const CONFIG = {
    SUPABASE_URL: 'TU_SUPABASE_URL_AQUI',
    SUPABASE_ANON_KEY: 'TU_SUPABASE_API_KEY_AQUI'
};

// Inicializamos el cliente de Supabase usando el script global cargado vía CDN
const supabase = supabase.createClient(CONFIG.SUPABASE_URL, CONFIG.SUPABASE_ANON_KEY);

/**
 * Función asíncrona para hacer un SELECT a la tabla "productos"
 * y renderizar los resultados en el DOM.
 */
async function cargarProductos() {
    const contenedor = document.getElementById('productos-contenedor');
    
    try {
        // Hacemos la consulta a la tabla 'productos'
        const { data: productos, error } = await supabase
            .from('productos')
            .select('*');

        if (error) {
            throw error;
        }

        renderizarProductos(productos);
    } catch (error) {
        console.error('Error al cargar los productos:', error.message);
        contenedor.innerHTML = `
            <div class="error">
                <strong>Error de conexión:</strong> No se pudieron cargar los productos. 
                <br><br>
                <small>Detalle: ${error.message}</small>
                <br>
                <small>Asegúrate de haber configurado tu URL y API Key en app.js.</small>
            </div>
        `;
    }
}

/**
 * Función auxiliar para crear y añadir los elementos HTML al DOM
 */
function renderizarProductos(productos) {
    const contenedor = document.getElementById('productos-contenedor');
    contenedor.innerHTML = ''; // Limpiamos el loader o estado anterior
    
    if (!productos || productos.length === 0) {
        contenedor.innerHTML = '<div class="empty-state">No hay productos disponibles por el momento.</div>';
        return;
    }

    const lista = document.createElement('div');
    lista.className = 'productos-grid';

    productos.forEach(producto => {
        const card = document.createElement('div');
        card.className = 'producto-card';
        
        // Formatear el precio (asumiendo que viene como número)
        const precioFormateado = producto.precio !== undefined 
            ? new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN' }).format(producto.precio) 
            : '$0.00';

        card.innerHTML = `
            ${producto.imagen_url 
                ? `<img src="${producto.imagen_url}" alt="${producto.nombre || 'Producto'}" class="producto-imagen">` 
                : '<div class="producto-imagen-placeholder"></div>'
            }
            <div class="producto-info">
                <h3 class="producto-nombre">${producto.nombre || 'Producto sin nombre'}</h3>
                <p class="producto-descripcion">${producto.descripcion || ''}</p>
                <div class="producto-precio">${precioFormateado}</div>
                <button class="btn-comprar">Añadir al Carrito</button>
            </div>
        `;
        lista.appendChild(card);
    });

    contenedor.appendChild(lista);
}

// Ejecutar la carga de productos una vez que el DOM esté listo
document.addEventListener('DOMContentLoaded', cargarProductos);
