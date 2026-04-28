-- ============================================================
-- KESHALI DESIGN — Migración 002: Inventario compartido
-- Stock por categoría + tamaño + color (no por variante)
-- Ejecutar en Supabase SQL Editor
-- ============================================================

-- 1. Tabla de inventario
CREATE TABLE IF NOT EXISTS inventory (
  id           uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  category_id  uuid NOT NULL REFERENCES categories(id) ON DELETE CASCADE,
  size_id      uuid NOT NULL REFERENCES sizes(id) ON DELETE CASCADE,
  color_id     uuid NOT NULL REFERENCES colors(id) ON DELETE CASCADE,
  stock        int NOT NULL DEFAULT 0,
  updated_at   timestamptz NOT NULL DEFAULT now(),
  UNIQUE (category_id, size_id, color_id)
);

ALTER TABLE inventory DISABLE ROW LEVEL SECURITY;

-- 2. Quitar columna stock de product_variants (ya no se usa)
--    Primero drop la vista que depende de ella, luego la columna
DROP VIEW IF EXISTS catalog_view;
ALTER TABLE product_variants DROP COLUMN IF EXISTS stock;

-- 3. Actualizar catalog_view para leer stock desde inventory
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
