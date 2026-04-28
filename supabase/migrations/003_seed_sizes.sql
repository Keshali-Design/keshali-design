-- ============================================================
-- KESHALI DESIGN — Migración 003: Tamaños estándar Colombia
-- Tipos de tamaño + valores predefinidos listos para usar
-- Ejecutar en Supabase SQL Editor
-- ============================================================

-- ── 1. Tipos de tamaño ────────────────────────────────────────

INSERT INTO size_types (id, name, unit_label, active) VALUES
  ('10000000-0000-0000-0000-000000000001', 'Tazas',   'oz',    true),
  ('10000000-0000-0000-0000-000000000002', 'Tallas',  'talla', true),
  ('10000000-0000-0000-0000-000000000003', 'Termos',  'ml',    true),
  ('10000000-0000-0000-0000-000000000004', 'Único',   'ud',    true)
ON CONFLICT (id) DO NOTHING;

-- ── 2. Tamaños: Tazas (oz → ml) ──────────────────────────────
-- Las más comunes en sublimación Colombia

INSERT INTO sizes (size_type_id, label, alt_value, alt_label, sort_order, active) VALUES
  -- 11oz: la más vendida (blanca estándar, mágica, glass)
  ('10000000-0000-0000-0000-000000000001', '11 oz', '325', '325 ml', 10, true),
  -- 15oz: taza grande
  ('10000000-0000-0000-0000-000000000001', '15 oz', '444', '444 ml', 20, true)
ON CONFLICT DO NOTHING;

-- ── 3. Tamaños: Tallas de ropa ────────────────────────────────
-- Tallas estándar Colombia (mismas que internacionales)

INSERT INTO sizes (size_type_id, label, alt_value, alt_label, sort_order, active) VALUES
  ('10000000-0000-0000-0000-000000000002', 'XS',   null, null, 10, true),
  ('10000000-0000-0000-0000-000000000002', 'S',    null, null, 20, true),
  ('10000000-0000-0000-0000-000000000002', 'M',    null, null, 30, true),
  ('10000000-0000-0000-0000-000000000002', 'L',    null, null, 40, true),
  ('10000000-0000-0000-0000-000000000002', 'XL',   null, null, 50, true),
  ('10000000-0000-0000-0000-000000000002', 'XXL',  null, null, 60, true),
  ('10000000-0000-0000-0000-000000000002', '3XL',  null, null, 70, true)
ON CONFLICT DO NOTHING;

-- ── 4. Tamaños: Termos / Vasos ────────────────────────────────
-- Capacidades comunes en sublimación y termos

INSERT INTO sizes (size_type_id, label, alt_value, alt_label, sort_order, active) VALUES
  ('10000000-0000-0000-0000-000000000003', '350 ml',  '350',  null, 10, true),
  ('10000000-0000-0000-0000-000000000003', '500 ml',  '500',  null, 20, true),
  ('10000000-0000-0000-0000-000000000003', '750 ml',  '750',  null, 30, true),
  ('10000000-0000-0000-0000-000000000003', '1000 ml', '1000', '1 L', 40, true)
ON CONFLICT DO NOTHING;

-- ── 5. Tamaño único (para productos sin variación de tamaño) ──
-- Ej: fundas de celular, mouse pads, cojines tamaño fijo

INSERT INTO sizes (size_type_id, label, alt_value, alt_label, sort_order, active) VALUES
  ('10000000-0000-0000-0000-000000000004', 'Único', null, null, 10, true)
ON CONFLICT DO NOTHING;
