# Gestión de Roles de Usuario

Actualmente, el sistema está diseñado con una arquitectura de permisos simplificada, ideal para esta etapa del proyecto de grado.

## Rol Activo: Administrador (Gestión de Ventas)

Por el momento, el sistema contempla **únicamente un rol de administrador**. Todos los usuarios autenticados que inicien sesión asumen implícitamente este nivel de privilegios, enfocado en el control centralizado de la gestión de ventas y el inventario.

### Privilegios del Administrador:
- **Catálogo de Productos:** Tiene la capacidad de crear nuevos artículos, actualizar precios o cantidades en stock y eliminar productos de la base de datos.
- **Sin Restricciones Internas:** Mientras el usuario posea el rol `authenticated` en su token de sesión, las políticas de Supabase le permitirán alterar cualquier fila de la tabla `productos` sin distinción de quién la haya creado.

> **Nota para Futuras Iteraciones:** Si el proyecto requiere separar las vistas entre "Clientes" y "Vendedores", será necesario implementar una tabla adicional (ej. `perfiles` o `roles`) vinculada a la tabla nativa de autenticación (`auth.users`) de Supabase, y configurar políticas RLS más granulares que verifiquen el rol específico de cada usuario.
