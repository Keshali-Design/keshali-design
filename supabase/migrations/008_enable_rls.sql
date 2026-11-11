-- Activa Row Level Security en todas las tablas.
--
-- 001/002 habían DESACTIVADO RLS en todo, y NEXT_PUBLIC_SUPABASE_ANON_KEY va
-- dentro del JavaScript que descarga cada visitante: con RLS apagado,
-- cualquiera podía consultar /rest/v1/orders y ver nombre, correo, teléfono y
-- dirección de todos los clientes, o llamar /rest/v1/rpc/decrement_inventory
-- y vaciar el stock.
--
-- Después de esto:
--   - anon/authenticated solo pueden LEER las tablas del catálogo.
--   - orders/order_items quedan invisibles para ellos.
--   - El admin, el checkout y el webhook usan la service role key, que se
--     salta RLS, así que siguen funcionando igual.
--
-- Todo va en una transacción: si algo falla, no queda aplicado a medias.

BEGIN;

-- 1. RLS en todas las tablas del schema public (incluidas las que no conocemos,
--    p. ej. variant_color_zones: sin política = privadas por defecto).
DO $$
DECLARE t record;
BEGIN
  FOR t IN SELECT tablename FROM pg_tables WHERE schemaname = 'public' LOOP
    EXECUTE format('ALTER TABLE public.%I ENABLE ROW LEVEL SECURITY', t.tablename);
  END LOOP;
END $$;

-- 2. Catálogo público: solo lectura.
DO $$
DECLARE t text;
BEGIN
  FOREACH t IN ARRAY ARRAY[
    'categories', 'colors', 'sizes', 'size_types',
    'category_colors', 'category_sizes',
    'products', 'product_sizes', 'product_colors', 'product_variants',
    'product_images', 'inventory'
  ] LOOP
    IF to_regclass('public.' || t) IS NOT NULL THEN
      EXECUTE format('DROP POLICY IF EXISTS "Lectura pública del catálogo" ON public.%I', t);
      EXECUTE format(
        'CREATE POLICY "Lectura pública del catálogo" ON public.%I FOR SELECT TO anon, authenticated USING (true)',
        t
      );
    END IF;
  END LOOP;
END $$;

-- 3. Datos de clientes: sin políticas (RLS ya los bloquea) y además sin permisos.
REVOKE ALL ON public.orders, public.order_items FROM anon, authenticated;

-- 4. catalog_view corre con los permisos de quien consulta, así respeta las
--    políticas de arriba en vez de saltárselas con los del dueño.
--    OJO: si en el futuro se recrea con CREATE OR REPLACE VIEW, agregar
--    "WITH (security_invoker = on)".
DO $$
BEGIN
  -- security_invoker en vistas existe desde Postgres 15.
  IF current_setting('server_version_num')::int >= 150000 THEN
    ALTER VIEW public.catalog_view SET (security_invoker = on);
  ELSE
    RAISE NOTICE 'Postgres < 15: catalog_view sigue con permisos del dueño (solo expone datos de catálogo).';
  END IF;
END $$;

-- 5. decrement_inventory (005) era invocable por cualquiera vía la API.
REVOKE EXECUTE ON FUNCTION public.decrement_inventory(uuid, uuid, uuid, int) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.decrement_inventory(uuid, uuid, uuid, int) TO service_role;

COMMIT;
