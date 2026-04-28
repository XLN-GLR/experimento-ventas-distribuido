-- Definición de la tabla productos en Supabase (PostgreSQL)

CREATE TABLE IF NOT EXISTS public.productos (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    nombre VARCHAR(255) NOT NULL,
    descripcion TEXT,
    precio NUMERIC(10, 2) NOT NULL CHECK (precio >= 0),
    stock INTEGER NOT NULL DEFAULT 0 CHECK (stock >= 0),
    activo BOOLEAN NOT NULL DEFAULT true,
    creado_en TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    actualizado_en TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Índices para optimizar las búsquedas más comunes
CREATE INDEX IF NOT EXISTS idx_productos_nombre ON public.productos (nombre);
CREATE INDEX IF NOT EXISTS idx_productos_activo ON public.productos (activo);

-- Comentarios descriptivos para documentar la base de datos
COMMENT ON TABLE public.productos IS 'Tabla principal para almacenar la información de los productos.';
COMMENT ON COLUMN public.productos.id IS 'Identificador único del producto.';
COMMENT ON COLUMN public.productos.nombre IS 'Nombre visible del producto.';
COMMENT ON COLUMN public.productos.precio IS 'Precio unitario del producto en la moneda local.';
COMMENT ON COLUMN public.productos.stock IS 'Cantidad de unidades disponibles en el inventario.';

-- ==========================================
-- POLÍTICAS DE SEGURIDAD A NIVEL DE FILA (RLS)
-- ==========================================
-- Se habilita RLS para proteger la tabla contra accesos no autorizados.
ALTER TABLE public.productos ENABLE ROW LEVEL SECURITY;

-- 1. Política de Lectura (SELECT)
-- Permite que cualquier usuario (incluso no autenticado) pueda ver el catálogo de productos.
CREATE POLICY "Permitir lectura pública"
ON public.productos
FOR SELECT
TO anon, authenticated
USING (true);

-- 2. Política de Creación (INSERT)
-- Restringe la creación de nuevos productos únicamente a usuarios con sesión iniciada.
CREATE POLICY "Permitir inserciones a autenticados"
ON public.productos
FOR INSERT
TO authenticated
WITH CHECK (true);

-- 3. Política de Actualización (UPDATE)
-- Restringe la modificación de productos existentes únicamente a usuarios con sesión iniciada.
CREATE POLICY "Permitir actualizaciones a autenticados"
ON public.productos
FOR UPDATE
TO authenticated
USING (true)
WITH CHECK (true);

-- 4. Política de Eliminación (DELETE)
-- Restringe el borrado de productos únicamente a usuarios con sesión iniciada.
CREATE POLICY "Permitir eliminaciones a autenticados"
ON public.productos
FOR DELETE
TO authenticated
USING (true);
