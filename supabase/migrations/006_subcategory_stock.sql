-- Moves the stock unit from "main category" to "subcategory when present".
--
-- Until now, category_colors/category_sizes/inventory were only configured
-- at the main-category level (categories.parent_id IS NULL), so every
-- subcategory silently shared one stock pool with its siblings — e.g. Buzo,
-- Camisetas DTF and Camisetas Sublimación (all under "Hombre") would have
-- drawn from the exact same inventory row per size+color, even though
-- they're physically different garments. "Hombre" also had no
-- size_type_id at all, which is why it had zero manageable stock.
--
-- From now on: if a product has a subcategory, its stock/colors/sizes are
-- governed by the subcategory. Only categories with no subcategories
-- (Gorras, Regalos, ...) keep using their own top-level pool, unchanged.

-- 1. "Hombre" was missing size_type_id entirely — without it, no sizes
--    could ever be configured for it or its children. Match its siblings
--    (Mujer/Niños/Niñas/Bebé), which already use the clothing size type.
UPDATE categories
SET size_type_id = '10000000-0000-0000-0000-000000000002'
WHERE parent_id IS NULL AND size_type_id IS NULL;

-- 2. Every subcategory needs its own size_type_id to know which sizes it
--    can offer, since it's becoming an independent stock unit. Inherit it
--    from the parent (a subcategory has never needed a different size
--    *system* than its siblings — just its own stock count).
UPDATE categories sub
SET size_type_id = parent.size_type_id
FROM categories parent
WHERE sub.parent_id = parent.id
  AND sub.size_type_id IS DISTINCT FROM parent.size_type_id;

-- 3. Seed each subcategory's available colors/sizes from what its parent
--    currently has configured, so the admin panel isn't blank for every
--    subcategory on day one. Additive only — never overwrites anything a
--    subcategory might already have.
INSERT INTO category_colors (category_id, color_id, active)
SELECT sub.id, pc.color_id, pc.active
FROM categories sub
JOIN category_colors pc ON pc.category_id = sub.parent_id
WHERE sub.parent_id IS NOT NULL
ON CONFLICT (category_id, color_id) DO NOTHING;

INSERT INTO category_sizes (category_id, size_id, active)
SELECT sub.id, ps.size_id, ps.active
FROM categories sub
JOIN category_sizes ps ON ps.category_id = sub.parent_id
WHERE sub.parent_id IS NOT NULL
ON CONFLICT (category_id, size_id) DO NOTHING;

-- 4. catalog_view: stock now joins on the subcategory when the product has
--    one, falling back to the main category otherwise. Existing inventory
--    rows keyed by a main category that HAS subcategories become orphaned
--    (no longer read) — that pooled number can't be auto-split between
--    e.g. Blusa/Blusón/CROP TOP, so re-enter real counts per subcategory
--    in /admin/stock after this runs.
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
LEFT JOIN inventory    inv   ON inv.category_id = COALESCE(subcat.id, cat.id)
                             AND inv.size_id    = pv.size_id
                             AND inv.color_id   = pv.color_id;
