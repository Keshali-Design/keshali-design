/**
 * Fixes product_images.url records that still point to Supabase Storage.
 * Derives the S3 URL from the filename already in the URL path.
 *
 * Run: node scripts/fix-db-image-urls.mjs
 */

import { createClient } from "@supabase/supabase-js";
import { readFileSync } from "fs";
import { resolve, dirname } from "path";
import { fileURLToPath } from "url";

// ── Load .env ─────────────────────────────────────────────────
const __dirname = dirname(fileURLToPath(import.meta.url));
const envPath = resolve(__dirname, "../.env");
const lines = readFileSync(envPath, "utf-8").split(/\r?\n/);
for (const line of lines) {
  const trimmed = line.trim();
  if (!trimmed || trimmed.startsWith("#")) continue;
  const eq = trimmed.indexOf("=");
  if (eq === -1) continue;
  const key = trimmed.slice(0, eq).trim();
  const val = trimmed.slice(eq + 1).trim().replace(/^["']|["']$/g, "");
  if (key) process.env[key] = val;
}

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY,
);

const BUCKET = process.env.AWS_S3_BUCKET;
const REGION = process.env.AWS_REGION;
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;

const S3_BASE = `https://${BUCKET}.s3.${REGION}.amazonaws.com`;
const SUPABASE_PRODUCT_BASE = `${SUPABASE_URL}/storage/v1/object/public/product-images/`;
const SUPABASE_CATEGORY_BASE = `${SUPABASE_URL}/storage/v1/object/public/category-images/`;

async function fixProductImages() {
  console.log("\n📦 Actualizando product_images...");

  const { data, error } = await supabase
    .from("product_images")
    .select("id, url")
    .like("url", `${SUPABASE_URL}%`);

  if (error) { console.error(error.message); return; }
  console.log(`   ${data?.length ?? 0} registros con URL de Supabase`);

  let updated = 0, skipped = 0;
  for (const row of data ?? []) {
    if (!row.url.includes("/product-images/")) { skipped++; continue; }
    const fileName = row.url.replace(SUPABASE_PRODUCT_BASE, "").split("?")[0];
    const newUrl = `${S3_BASE}/product-images/${fileName}`;

    const { error: e } = await supabase
      .from("product_images")
      .update({ url: newUrl })
      .eq("id", row.id);

    if (e) console.warn(`   ⚠️  ${row.id}: ${e.message}`);
    else updated++;
  }
  console.log(`   ✓ ${updated} actualizados, ${skipped} omitidos`);
}

async function fixCategoryImages() {
  console.log("\n🗂️  Actualizando categories.image_url...");

  const { data, error } = await supabase
    .from("categories")
    .select("id, image_url")
    .like("image_url", `${SUPABASE_URL}%`);

  if (error) { console.error(error.message); return; }
  console.log(`   ${data?.length ?? 0} registros con URL de Supabase`);

  let updated = 0;
  for (const row of data ?? []) {
    if (!row.image_url) continue;
    const fileName = row.image_url.replace(SUPABASE_CATEGORY_BASE, "").split("?")[0];
    const newUrl = `${S3_BASE}/category-images/${fileName}`;

    const { error: e } = await supabase
      .from("categories")
      .update({ image_url: newUrl })
      .eq("id", row.id);

    if (e) console.warn(`   ⚠️  ${row.id}: ${e.message}`);
    else updated++;
  }
  console.log(`   ✓ ${updated} actualizados`);
}

(async () => {
  console.log("🔧 Corrigiendo URLs en DB: Supabase → S3");
  await fixProductImages();
  await fixCategoryImages();
  console.log("\n✅ Listo.");
})();
