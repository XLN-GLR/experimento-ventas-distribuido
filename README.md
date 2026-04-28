# Módulo de Persistencia de Datos en la Nube

## Estado del Despliegue

- **Entorno:** Producción
- **URL Pública de la Aplicación:** `[Pendiente de asignar tras el despliegue]`
- **Estado de la Base de Datos:** Activa (Supabase)

---

Este repositorio contiene la configuración y esquemas iniciales para el módulo que gestiona la persistencia de datos en la nube de nuestra aplicación, apoyándose en **Supabase**.

## Propósito del Módulo

El objetivo de este módulo es proporcionar una capa de datos centralizada, segura y de fácil acceso. Al utilizar una solución Backend-as-a-Service (BaaS), delegamos la infraestructura y obtenemos APIs inmediatas y seguras para interactuar con la información. Además, el backend ya soporta de forma nativa operaciones de escritura asíncronas desde el frontend, permitiendo una experiencia de usuario más fluida. El sistema ahora soporta la gestión completa de registros (creación, lectura, actualización y eliminación), permitiendo mantener un inventario actualizado y libre de errores.

## Endpoints Automáticos (PostgREST)

Una de las principales ventajas de usar Supabase es que, al definir el esquema de la base de datos (ver `schema.sql`), automáticamente se generan endpoints RESTful a través de PostgREST. No es necesario escribir código de enrutadores o controladores.

A continuación, se documentan los endpoints automáticos disponibles para la tabla `productos`:

*   **Listar Productos**
    *   `GET /rest/v1/productos`
    *   *Soporta filtrado dinámico (ej: `?precio=gte.100`), ordenamiento (ej: `?order=creado_en.desc`) y paginación.*

*   **Obtener un Producto por ID**
    *   `GET /rest/v1/productos?id=eq.{id}`

*   **Crear un Producto**
    *   `POST /rest/v1/productos`
    *   *El cuerpo (body) debe contener un objeto JSON con los datos del producto (nombre, precio, etc).*

*   **Actualizar un Producto**
    *   `PATCH /rest/v1/productos?id=eq.{id}`
    *   *Solo se actualizarán los campos enviados en el objeto JSON.*

*   **Eliminar un Producto**
    *   `DELETE /rest/v1/productos?id=eq.{id}`

> **Importante:** Para realizar peticiones a estos endpoints desde un cliente, es necesario proveer la clave pública (`anon key`) en los encabezados HTTP (`apikey` y `Authorization: Bearer <anon_key>`).

## Archivos del Repositorio

*   `schema.sql`: Definición técnica de la tabla `productos` con sus respectivos tipos de datos y restricciones de integridad.
*   `.gitignore`: Listado de archivos excluidos del repositorio para evitar la filtración de credenciales u otros datos sensibles.

## Seguridad de los Datos (Proyecto de Grado)

Para el contexto de este proyecto de grado, la seguridad de los datos y la integridad de la información son aspectos de suma importancia. Por esta razón, se han aplicado restricciones estrictas sobre la API y la base de datos a través de Políticas de Seguridad a Nivel de Fila (RLS) en Supabase. 

Actualmente, **todas las operaciones de escritura (creación, actualización y eliminación de registros)** están restringidas exclusivamente a usuarios que hayan iniciado sesión y cuenten con el rol `authenticated`. Esto previene cualquier manipulación pública o no autorizada del inventario y garantiza la fiabilidad del sistema en un entorno real. De esta forma, el backend está completamente blindado y solo responde a peticiones de usuarios registrados y confirmados. Además, el sistema ahora implementa un flujo de validación bidireccional entre la interfaz de usuario y el motor de identidad empresarial.

## Solución de Problemas Comunes (Troubleshooting)

### Conexión a Supabase
*   **Error 401 Unauthorized / JWT Expired:** Ocurre cuando el token de autenticación del usuario ha caducado. **Solución:** El usuario debe volver a iniciar sesión o el frontend debe implementar la renovación automática de tokens (`refresh token`).
*   **Error 403 Forbidden o filas vacías:** Indica un problema con las políticas RLS. **Solución:** Verifica que la política correspondiente (SELECT, INSERT, UPDATE o DELETE) esté activa y que el rol del usuario que realiza la petición coincida con el permitido (por ejemplo, `anon` vs `authenticated`).
*   **Failed to fetch (CORS o Red):** Asegúrate de que las variables de entorno (`URL` y `ANON_KEY`) estén configuradas correctamente tanto en tu archivo `.env` local como en la plataforma de producción.

### Sincronización en GitHub
*   **Updates were rejected (non-fast-forward):** Este error de Git ocurre cuando intentas hacer `push` a una rama remota que tiene modificaciones que tú no tienes en local. **Solución:** Ejecuta `git pull origin main` (o el nombre de tu rama) primero, resuelve cualquier conflicto si existe, y luego intenta hacer el `push` nuevamente.
*   **Credenciales no válidas:** Si no te permite subir cambios, verifica que estés usando un *Personal Access Token (PAT)* vigente de GitHub en lugar de tu contraseña habitual, o que tu clave SSH esté correctamente vinculada a tu cuenta.
