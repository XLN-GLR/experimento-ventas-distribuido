# Guía de Despliegue y Variables de Entorno

Este documento proporciona las directrices necesarias para preparar y configurar la conexión de esta base de datos desde un entorno de desarrollo local hacia un entorno de producción seguro en la nube.

## 1. Diferencias entre Entornos

Es indispensable comprender cómo manejan los secretos el desarrollo y la producción:

*   **Entorno Local (Desarrollo):** Durante el desarrollo, las credenciales (como la URL de Supabase y las claves API) se almacenan en un archivo `.env` o `.env.local` en tu máquina. Este archivo **nunca debe subirse** a un repositorio público, razón por la cual se incluye en el `.gitignore`.
*   **Entorno en la Nube (Producción):** Al subir tu aplicación a un proveedor de hosting (como Vercel, Netlify, Render, etc.), no subes el archivo `.env`. En su lugar, usas la interfaz de usuario del proveedor para configurar y guardar de forma encriptada las "Variables de Entorno". En el momento del despliegue o la ejecución, el servidor tomará estas variables de forma segura.

## 2. Vincular la Base de Datos de Supabase

Para que el frontend o backend se comuniquen correctamente con los endpoints y la base de datos de producción descritos en el archivo `schema.sql`, necesitas obtener dos variables desde tu panel de Supabase:

1.  Inicia sesión en [Supabase](https://supabase.com).
2.  Ve a tu proyecto y haz clic en la sección **Project Settings** (engranaje).
3.  Entra a la pestaña **API**.
4.  Copia la **Project URL** y la clave **Project API Keys** marcada como `anon` / `public`.

## 3. Configuración en el Servidor de Hosting

Los pasos para inyectar las credenciales varían ligeramente según la plataforma de alojamiento, pero la estructura base es la misma:

1.  Abre el panel de control del proyecto en tu plataforma de hosting (ej. *Settings* en Vercel o Netlify).
2.  Ve a la sección **Environment Variables** (Variables de Entorno).
3.  Añade las variables necesarias según tu framework de preferencia. Por ejemplo, en Next.js o Vite:
    *   **Variable 1:** 
        *   Key: `VITE_SUPABASE_URL` o `NEXT_PUBLIC_SUPABASE_URL`
        *   Value: *[La URL que copiaste de Supabase]*
    *   **Variable 2:** 
        *   Key: `VITE_SUPABASE_ANON_KEY` o `NEXT_PUBLIC_SUPABASE_ANON_KEY`
        *   Value: *[El token anon que copiaste de Supabase]*
4.  Guarda los cambios y realiza un **nuevo despliegue** (Redeploy) para que la configuración surta efecto.

> **Importante:** Dado que la clave `anon` es pública en el frontend, la seguridad e integridad de los datos dependen enteramente de las Políticas de Seguridad a Nivel de Fila (RLS) que configuramos previamente para exigir el rol `authenticated`.
