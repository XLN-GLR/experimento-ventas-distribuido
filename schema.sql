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

-- Políticas de Seguridad a Nivel de Fila (RLS)
ALTER TABLE public.productos ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Permitir inserciones a autenticados"
ON public.productos
FOR INSERT
TO authenticated
WITH CHECK (true);

CREATE POLICY "Permitir actualizaciones a autenticados"
ON public.productos
FOR UPDATE
TO authenticated
USING (true)
WITH CHECK (true);

CREATE POLICY "Permitir eliminaciones a autenticados"
ON public.productos
FOR DELETE
TO authenticated
USING (true);
