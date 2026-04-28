-- ============================================================
-- KESHALI DESIGN — Restructura de schema
-- Ejecutar en Supabase SQL Editor
-- ============================================================

-- ------------------------------------------------------------
-- 1. LIMPIAR DATOS Y TABLAS OBSOLETAS
-- ------------------------------------------------------------

DROP TABLE IF EXISTS order_items CASCADE;
DROP TABLE IF EXISTS orders CASCADE;
DROP TABLE IF EXISTS product_images CASCADE;
DROP TABLE IF EXISTS product_variants CASCADE;
DROP TABLE IF EXISTS products CASCADE;
DROP TABLE IF EXISTS catalog_view CASCADE;
DROP TABLE IF EXISTS inventory CASCADE;

-- Tablas del schema viejo que se reemplazan completamente
DROP TABLE IF EXISTS sizes CASCADE;
DROP TABLE IF EXISTS size_types CASCADE;
DROP TABLE IF EXISTS designs CASCADE;
DROP TABLE IF EXISTS category_colors CASCADE;
DROP TABLE IF EXISTS category_sizes CASCADE;
DROP TABLE IF EXISTS product_sizes CASCADE;
DROP TABLE IF EXISTS product_colors CASCADE;

-- Limpiar categories pero conservar la tabla (se altera más abajo)
TRUNCATE TABLE categories CASCADE;

-- ------------------------------------------------------------
-- 2. TIPOS DE TAMAÑO
-- ------------------------------------------------------------

CREATE TABLE IF NOT EXISTS size_types (
  id         uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name       text NOT NULL,          -- "Onzas", "Tallas de ropa", "ML"
  unit_label text NOT NULL,          -- "oz", "talla", "ml"
  active     boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- ------------------------------------------------------------
-- 3. TAMAÑOS / TALLAS
-- ------------------------------------------------------------

CREATE TABLE IF NOT EXISTS sizes (
  id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  size_type_id  uuid NOT NULL REFERENCES size_types(id) ON DELETE CASCADE,
  label         text NOT NULL,       -- "11 oz", "Talla L", "500 ml"
  alt_value     text,                -- "325" (valor de conversión)
  alt_label     text,                -- "325 ml" o "12" (número en talla)
  sort_order    int NOT NULL DEFAULT 0,
  active        boolean NOT NULL DEFAULT true,
  created_at    timestamptz NOT NULL DEFAULT now()
);

-- ------------------------------------------------------------
-- 4. CATEGORÍAS (alterar para agregar size_type_id)
-- ------------------------------------------------------------

ALTER TABLE categories
  ADD COLUMN IF NOT EXISTS size_type_id uuid REFERENCES size_types(id);

-- ------------------------------------------------------------
-- 5. COLORES POR CATEGORÍA (habilitar/deshabilitar)
-- ------------------------------------------------------------

CREATE TABLE IF NOT EXISTS category_colors (
  id           uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  category_id  uuid NOT NULL REFERENCES categories(id) ON DELETE CASCADE,
  color_id     uuid NOT NULL REFERENCES colors(id) ON DELETE CASCADE,
  active       boolean NOT NULL DEFAULT true,
  UNIQUE (category_id, color_id)
);

-- ------------------------------------------------------------
-- 6. TAMAÑOS POR CATEGORÍA (subset del size_type)
-- ------------------------------------------------------------

CREATE TABLE IF NOT EXISTS category_sizes (
  id           uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  category_id  uuid NOT NULL REFERENCES categories(id) ON DELETE CASCADE,
  size_id      uuid NOT NULL REFERENCES sizes(id) ON DELETE CASCADE,
  active       boolean NOT NULL DEFAULT true,
  UNIQUE (category_id, size_id)
);

-- ------------------------------------------------------------
-- 7. INVENTARIO (stock compartido por categoría + tamaño + color)
--    Una taza blanca de 11oz aplica a TODOS los productos de
--    la categoría "Tazas" con ese tamaño y ese color.
-- ------------------------------------------------------------

CREATE TABLE IF NOT EXISTS inventory (
  id           uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  category_id  uuid NOT NULL REFERENCES categories(id) ON DELETE CASCADE,
  size_id      uuid NOT NULL REFERENCES sizes(id) ON DELETE CASCADE,
  color_id     uuid NOT NULL REFERENCES colors(id) ON DELETE CASCADE,
  stock        int NOT NULL DEFAULT 0,
  updated_at   timestamptz NOT NULL DEFAULT now(),
  UNIQUE (category_id, size_id, color_id)
);

-- ------------------------------------------------------------
-- 8. PRODUCTOS
-- ------------------------------------------------------------

CREATE TABLE IF NOT EXISTS products (
  id                    uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  category_id           uuid NOT NULL REFERENCES categories(id),
  name                  text NOT NULL,
  description           text,
  price_varies_by_color boolean NOT NULL DEFAULT false,
  active                boolean NOT NULL DEFAULT true,
  created_at            timestamptz NOT NULL DEFAULT now(),
  updated_at            timestamptz NOT NULL DEFAULT now()
);

-- ------------------------------------------------------------
-- 9. TAMAÑOS DEL PRODUCTO (precio base por tamaño)
-- ------------------------------------------------------------

CREATE TABLE IF NOT EXISTS product_sizes (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id  uuid NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  size_id     uuid NOT NULL REFERENCES sizes(id),
  price       numeric(12,2) NOT NULL DEFAULT 0,
  active      boolean NOT NULL DEFAULT true,
  UNIQUE (product_id, size_id)
);

-- ------------------------------------------------------------
-- 10. COLORES DEL PRODUCTO
-- ------------------------------------------------------------

CREATE TABLE IF NOT EXISTS product_colors (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id  uuid NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  color_id    uuid NOT NULL REFERENCES colors(id),
  active      boolean NOT NULL DEFAULT true,
  UNIQUE (product_id, color_id)
);

-- ------------------------------------------------------------
-- 11. VARIANTES (color × tamaño, auto-generadas)
--     Sin stock propio — el stock viene de inventory
-- ------------------------------------------------------------

CREATE TABLE IF NOT EXISTS product_variants (
  id             uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id     uuid NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  color_id       uuid NOT NULL REFERENCES colors(id),
  size_id        uuid NOT NULL REFERENCES sizes(id),
  sku            text NOT NULL UNIQUE,
  price_override numeric(12,2),   -- solo si price_varies_by_color = true
  active         boolean NOT NULL DEFAULT true,
  created_at     timestamptz NOT NULL DEFAULT now(),
  updated_at     timestamptz NOT NULL DEFAULT now(),
  UNIQUE (product_id, color_id, size_id)
);

-- ------------------------------------------------------------
-- 12. IMÁGENES POR VARIANTE
-- ------------------------------------------------------------

CREATE TABLE IF NOT EXISTS product_images (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  variant_id  uuid NOT NULL REFERENCES product_variants(id) ON DELETE CASCADE,
  url         text NOT NULL,
  alt_text    text,
  is_primary  boolean NOT NULL DEFAULT false,
  sort_order  int NOT NULL DEFAULT 0,
  created_at  timestamptz NOT NULL DEFAULT now()
);

-- ------------------------------------------------------------
-- 13. PEDIDOS
-- ------------------------------------------------------------

CREATE TABLE IF NOT EXISTS orders (
  id               uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  order_number     text NOT NULL UNIQUE,
  customer_name    text NOT NULL,
  customer_email   text,
  customer_phone   text,
  shipping_address jsonb NOT NULL DEFAULT '{}',
  subtotal         numeric(12,2) NOT NULL DEFAULT 0,
  shipping_cost    numeric(12,2) NOT NULL DEFAULT 0,
  total            numeric(12,2) NOT NULL DEFAULT 0,
  status           text NOT NULL DEFAULT 'pending',
  notes            text,
  tracking_code    text,
  shipping_company text,
  created_at       timestamptz NOT NULL DEFAULT now(),
  updated_at       timestamptz NOT NULL DEFAULT now()
);

-- ------------------------------------------------------------
-- 14. ÍTEMS DE PEDIDO
-- ------------------------------------------------------------

CREATE TABLE IF NOT EXISTS order_items (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id    uuid NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  variant_id  uuid NOT NULL REFERENCES product_variants(id),
  quantity    int NOT NULL DEFAULT 1,
  unit_price  numeric(12,2) NOT NULL,
  total_price numeric(12,2) NOT NULL,
  created_at  timestamptz NOT NULL DEFAULT now()
);

-- ------------------------------------------------------------
-- 15. VISTA DE CATÁLOGO
--     stock viene de inventory (categoría + tamaño + color)
-- ------------------------------------------------------------

CREATE OR REPLACE VIEW catalog_view AS
SELECT
  pv.id              AS variant_id,
  pv.sku,
  pv.active          AS variant_active,
  pv.price_override,

  COALESCE(inv.stock, 0) AS stock,

  p.id               AS product_id,
  p.name             AS product_name,
  p.description,
  p.price_varies_by_color,
  p.active           AS product_active,

  ps.price           AS base_price,
  COALESCE(pv.price_override, ps.price) AS price,

  s.id               AS size_id,
  s.label            AS size_label,
  s.alt_value,
  s.alt_label,
  s.sort_order       AS size_sort_order,

  st.name            AS size_type_name,
  st.unit_label,

  c.id               AS color_id,
  c.name             AS color_name,
  c.hex_code,
  c.color_code,

  cat.id             AS category_id,
  cat.name           AS category_name,
  cat.slug           AS category_slug,
  cat.active         AS category_active,

  (SELECT pi.url FROM product_images pi
   WHERE pi.variant_id = pv.id AND pi.is_primary = true
   LIMIT 1) AS primary_image_url

FROM product_variants pv
JOIN products         p   ON p.id  = pv.product_id
JOIN product_sizes    ps  ON ps.product_id = p.id AND ps.size_id = pv.size_id
JOIN sizes            s   ON s.id  = pv.size_id
JOIN size_types       st  ON st.id = s.size_type_id
JOIN colors           c   ON c.id  = pv.color_id
JOIN categories       cat ON cat.id = p.category_id
LEFT JOIN inventory   inv ON inv.category_id = cat.id
                          AND inv.size_id    = pv.size_id
                          AND inv.color_id   = pv.color_id;

-- ------------------------------------------------------------
-- 16. RLS — deshabilitar para todas (service role las bypasa)
-- ------------------------------------------------------------

ALTER TABLE size_types      DISABLE ROW LEVEL SECURITY;
ALTER TABLE sizes            DISABLE ROW LEVEL SECURITY;
ALTER TABLE category_colors  DISABLE ROW LEVEL SECURITY;
ALTER TABLE category_sizes   DISABLE ROW LEVEL SECURITY;
ALTER TABLE inventory        DISABLE ROW LEVEL SECURITY;
ALTER TABLE products         DISABLE ROW LEVEL SECURITY;
ALTER TABLE product_sizes    DISABLE ROW LEVEL SECURITY;
ALTER TABLE product_colors   DISABLE ROW LEVEL SECURITY;
ALTER TABLE product_variants DISABLE ROW LEVEL SECURITY;
ALTER TABLE product_images   DISABLE ROW LEVEL SECURITY;
ALTER TABLE orders           DISABLE ROW LEVEL SECURITY;
ALTER TABLE order_items      DISABLE ROW LEVEL SECURITY;
