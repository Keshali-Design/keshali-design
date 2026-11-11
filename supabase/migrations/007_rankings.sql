-- "Lo más vendido" y "Lo más buscado" para la home.
--
-- Los rankings se exponen solo como funciones SECURITY DEFINER que devuelven
-- product_id + un número agregado: las páginas públicas (anon key) nunca leen
-- orders/order_items directamente, y esto sigue funcionando el día que se
-- active RLS en esas tablas.

-- ── Vistas por producto ("más buscado") ──────────────────────
CREATE TABLE IF NOT EXISTS product_views (
  product_id  uuid PRIMARY KEY REFERENCES products(id) ON DELETE CASCADE,
  views       bigint NOT NULL DEFAULT 0,
  updated_at  timestamptz NOT NULL DEFAULT now()
);

-- Sin políticas: solo se accede vía las funciones de abajo / service role.
ALTER TABLE product_views ENABLE ROW LEVEL SECURITY;

CREATE OR REPLACE FUNCTION increment_product_view(p_product_id uuid)
RETURNS void
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  INSERT INTO product_views (product_id, views, updated_at)
  VALUES (p_product_id, 1, now())
  ON CONFLICT (product_id) DO UPDATE
    SET views = product_views.views + 1, updated_at = now();
$$;

-- Solo el servidor (service role) suma vistas; el navegador no puede llamarla directo.
REVOKE EXECUTE ON FUNCTION increment_product_view(uuid) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION increment_product_view(uuid) TO service_role;

CREATE OR REPLACE FUNCTION get_most_viewed_products(p_limit int DEFAULT 8)
RETURNS TABLE (product_id uuid, views bigint)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT pv.product_id, pv.views
  FROM product_views pv
  JOIN products p ON p.id = pv.product_id AND p.active
  ORDER BY pv.views DESC
  LIMIT p_limit;
$$;

-- ── Unidades vendidas ("más vendido") ─────────────────────────
-- Solo pedidos pagados/en curso; pendientes y cancelados no cuentan.
CREATE OR REPLACE FUNCTION get_best_selling_products(p_limit int DEFAULT 8)
RETURNS TABLE (product_id uuid, units_sold bigint)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT var.product_id, SUM(oi.quantity)::bigint AS units_sold
  FROM order_items oi
  JOIN orders o            ON o.id = oi.order_id
  JOIN product_variants var ON var.id = oi.variant_id
  JOIN products p          ON p.id = var.product_id AND p.active
  WHERE o.status IN ('confirmed', 'shipped', 'delivered')
  GROUP BY var.product_id
  ORDER BY units_sold DESC
  LIMIT p_limit;
$$;
