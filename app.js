// Configuración de Supabase centralizada
const CONFIG = {
    SUPABASE_URL: 'TU_SUPABASE_URL_AQUI',
    SUPABASE_ANON_KEY: 'TU_SUPABASE_API_KEY_AQUI'
};

// Estado global de la aplicación
let currentProducts = [];
let editingProductId = null;

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

        currentProducts = productos || [];
        renderizarProductos(currentProducts);
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
                <div class="producto-acciones">
                    <button class="btn-editar" data-id="${producto.id}">Editar</button>
                    <button class="btn-eliminar" data-id="${producto.id}">Eliminar</button>
                </div>
            </div>
        `;

        // Asignar eventos a los botones de esta tarjeta
        const btnEditar = card.querySelector('.btn-editar');
        const btnEliminar = card.querySelector('.btn-eliminar');
        
        btnEditar.addEventListener('click', () => prepare_edit_mode(producto.id));
        btnEliminar.addEventListener('click', () => remove_inventory_item(producto.id));

        lista.appendChild(card);
    });

    contenedor.appendChild(lista);
}

/**
 * Función que prepara el formulario para edición
 */
function prepare_edit_mode(id) {
    const producto = currentProducts.find(p => p.id === id);
    if (!producto) return;

    editingProductId = id;

    // Llenar campos
    document.getElementById('product_name_input').value = producto.nombre || '';
    document.getElementById('product_price_input').value = producto.precio || '';
    document.getElementById('product_stock_input').value = producto.stock || '';

    // Actualizar UI del formulario
    document.querySelector('.minimal-form h2').textContent = 'Editar Producto';
    document.querySelector('.btn-submit').textContent = 'Actualizar Producto';

    // Opcional: enfocar el primer input y subir
    document.getElementById('product_name_input').focus();
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

/**
 * Función asíncrona para eliminar un producto
 */
async function remove_inventory_item(id) {
    const confirmacion = confirm("¿Estás seguro de que deseas eliminar este producto permanentemente?");
    if (!confirmacion) return;

    try {
        const { error } = await supabase
            .from('productos')
            .delete()
            .eq('id', id);

        if (error) {
            throw error;
        }

        // Refrescar lista
        await cargarProductos();
    } catch (error) {
        console.error('Error al eliminar:', error.message);
        alert(`No se pudo eliminar: ${error.message}`);
    }
}

/**
 * Función asíncrona que inserta o actualiza un producto en Supabase al enviar el formulario
 */
async function send_product_to_cloud(event) {
    event.preventDefault(); // Evita recargar la página

    // Capturar los valores
    const nombre = document.getElementById('product_name_input').value;
    const precio = parseFloat(document.getElementById('product_price_input').value);
    const stock = parseInt(document.getElementById('product_stock_input').value, 10);

    const btnSubmit = event.target.querySelector('.btn-submit');
    const textoOriginal = btnSubmit.textContent;
    btnSubmit.textContent = 'Guardando...';
    btnSubmit.disabled = true;

    try {
        let errorResult;

        if (editingProductId) {
            // Update
            const { error } = await supabase
                .from('productos')
                .update({ nombre, precio, stock })
                .eq('id', editingProductId);
            errorResult = error;
        } else {
            // Insert
            const { error } = await supabase
                .from('productos')
                .insert([{ nombre, precio, stock }]);
            errorResult = error;
        }

        if (errorResult) {
            throw errorResult;
        }

        // Limpiamos el formulario tras éxito
        event.target.reset();
        editingProductId = null;
        
        // Restaurar UI
        document.querySelector('.minimal-form h2').textContent = 'Añadir Nuevo Producto';
        
        // Refrescamos la lista para ver los cambios
        await cargarProductos();
    } catch (error) {
        console.error('Error al guardar el producto:', error.message);
        alert(`Error al guardar: ${error.message}`);
    } finally {
        btnSubmit.textContent = editingProductId ? 'Actualizar Producto' : 'Guardar Producto';
        btnSubmit.disabled = false;
    }
}

// Ejecutar la carga de productos y asociar eventos una vez que el DOM esté listo
document.addEventListener('DOMContentLoaded', () => {
    cargarProductos();
    
    const form = document.getElementById('add-product-form');
    if (form) {
        form.addEventListener('submit', send_product_to_cloud);
    }
});
