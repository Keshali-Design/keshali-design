-- Atomic inventory decrement: replaces the select-then-upsert pattern used
-- in checkout/actions.ts and admin/pedidos/nuevo/actions.ts, which raced
-- under concurrent checkouts (two requests could read the same stock value
-- and both subtract from it, causing overselling).
--
-- The UPDATE below runs as a single statement, so Postgres takes a row lock
-- for its duration and concurrent calls serialize instead of racing.

CREATE OR REPLACE FUNCTION decrement_inventory(
  p_category_id uuid,
  p_size_id uuid,
  p_color_id uuid,
  p_qty int
) RETURNS void AS $$
BEGIN
  INSERT INTO inventory (category_id, size_id, color_id, stock, updated_at)
  VALUES (p_category_id, p_size_id, p_color_id, 0, now())
  ON CONFLICT (category_id, size_id, color_id) DO NOTHING;

  UPDATE inventory
  SET stock = GREATEST(stock - p_qty, 0), updated_at = now()
  WHERE category_id = p_category_id AND size_id = p_size_id AND color_id = p_color_id;
END;
$$ LANGUAGE plpgsql;
