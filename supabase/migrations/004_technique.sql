-- Adds a "technique" (DTF / Sublimación) field to products, used for the
-- catalog technique filter. Also recreates catalog_view to expose it.
--
-- NOTE: new columns must be appended at the END of the SELECT list —
-- CREATE OR REPLACE VIEW cannot reorder or insert columns in the middle
-- of an existing view (Postgres error 42P16).

ALTER TABLE products ADD COLUMN IF NOT EXISTS technique text;

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

  subcat.id          AS subcategory_id,
  subcat.name        AS subcategory_name,
  subcat.slug        AS subcategory_slug,

  (SELECT pi.url FROM product_images pi
   WHERE pi.variant_id = pv.id AND pi.is_primary = true
   LIMIT 1) AS primary_image_url,

  p.technique

FROM product_variants pv
JOIN products         p      ON p.id  = pv.product_id
JOIN product_sizes    ps     ON ps.product_id = p.id AND ps.size_id = pv.size_id
JOIN sizes             s     ON s.id  = pv.size_id
JOIN size_types        st    ON st.id = s.size_type_id
JOIN colors             c    ON c.id  = pv.color_id
JOIN categories        cat   ON cat.id = p.category_id
LEFT JOIN categories   subcat ON subcat.id = p.subcategory_id
LEFT JOIN inventory    inv   ON inv.category_id = cat.id
                             AND inv.size_id    = pv.size_id
                             AND inv.color_id   = pv.color_id;
