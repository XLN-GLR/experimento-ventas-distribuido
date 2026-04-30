# Solución de Problemas de la API (API Troubleshooting)

## Error: 404 Not Found en el Endpoint de Autenticación

**Descripción del Error:**
Al intentar realizar operaciones de inicio de sesión o registro utilizando el cliente de Supabase, las peticiones hacia los endpoints de autenticación devuelven un error HTTP `404 Not Found`.

**Causa y Solución Técnica:**
Este error de enrutamiento generalmente ocurre cuando se incluye una ruta adicional en la variable de entorno o configuración `SUPABASE_URL` (por ejemplo, añadiendo `/rest/v1/` o similar al final de la URL). 

La solución técnica exige que la variable `SUPABASE_URL` contenga **únicamente el dominio raíz** del proyecto (ejemplo: `https://xxxx.supabase.co`). Esto es fundamental porque las librerías oficiales de Supabase (como `@supabase/supabase-js`) añaden internamente y de forma automática los prefijos necesarios según el servicio que se esté invocando:
- `/rest/v1/` para consultas a la base de datos (PostgREST).
- `/auth/v1/` para la gestión de identidad y autenticación (GoTrue).

Si se incluye algún prefijo en la URL base, la ruta final se duplicará o será incorrecta, resultando en un error 404.
