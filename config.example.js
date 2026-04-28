/**
 * config.example.js
 * 
 * 1. Copia este archivo y renómbralo a "config.js"
 * 2. Reemplaza los valores con las credenciales reales de tu proyecto de Supabase
 * 3. Asegúrate de añadir "config.js" a tu archivo .gitignore para no subir tus llaves al repositorio público.
 */

const CONFIG = {
    SUPABASE_URL: 'TU_SUPABASE_URL_AQUI',
    SUPABASE_ANON_KEY: 'TU_SUPABASE_API_KEY_AQUI'
};

// Nota: Si estuvieras usando un entorno con Node/Webpack/Vite, exportarías el objeto:
// export default CONFIG;
// En este caso, como lo cargamos directamente en el HTML, estará disponible globalmente.
