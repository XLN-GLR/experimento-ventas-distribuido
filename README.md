# Módulo de Persistencia de Datos en la Nube

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
