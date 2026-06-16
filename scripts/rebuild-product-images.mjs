/**
 * Reconstructs product_images records from S3 files + product_variants SKUs.
 * Files follow the naming: {SKU}.webp (primary), {SKU}-2.webp, {SKU}-3.webp...
 *
 * Run: node scripts/rebuild-product-images.mjs
 */

import { createClient } from "@supabase/supabase-js";
import { S3Client, ListObjectsV2Command } from "@aws-sdk/client-s3";
import { readFileSync } from "fs";
import { resolve, dirname } from "path";
import { fileURLToPath } from "url";

// ── Load .env ─────────────────────────────────────────────────
const __dirname = dirname(fileURLToPath(import.meta.url));
const lines = readFileSync(resolve(__dirname, "../.env"), "utf-8").split(/\r?\n/);
for (const line of lines) {
  const trimmed = line.trim();
  if (!trimmed || trimmed.startsWith("#")) continue;
  const eq = trimmed.indexOf("=");
  if (eq === -1) continue;
  process.env[trimmed.slice(0, eq).trim()] = trimmed.slice(eq + 1).trim().replace(/^["']|["']$/g, "");
}

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY,
);
const s3 = new S3Client({
  region: process.env.AWS_REGION,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  },
});
const BUCKET = process.env.AWS_S3_BUCKET;
const S3_BASE = `https://${BUCKET}.s3.${process.env.AWS_REGION}.amazonaws.com`;

// ── List all files in S3 product-images/ ─────────────────────
async function listS3Files() {
  const keys = [];
  let token;
  do {
    const res = await s3.send(new ListObjectsV2Command({
      Bucket: BUCKET,
      Prefix: "product-images/",
      ContinuationToken: token,
    }));
    for (const obj of res.Contents ?? []) keys.push(obj.Key);
    token = res.NextContinuationToken;
  } while (token);
  return keys;
}

// ── Main ──────────────────────────────────────────────────────
(async () => {
  console.log("🔧 Reconstruyendo product_images desde S3...\n");

  // 1. Load all variants (SKU → id)
  const { data: variants, error: ve } = await supabase
    .from("product_variants")
    .select("id, sku");
  if (ve) { console.error(ve.message); process.exit(1); }

  const skuToVariant = new Map(variants.map((v) => [v.sku.toLowerCase(), v]));
  console.log(`   ${variants.length} variantes cargadas`);

  // 2. List S3 files
  const keys = await listS3Files();
  console.log(`   ${keys.length} archivos en S3 product-images/\n`);

  // 3. Group files by variant SKU
  // File naming: {SKU}.webp → primary, {SKU}-N.webp → secondary
  // Strategy: strip folder prefix and .webp extension, then try to match
  // known SKUs by checking if filename starts with SKU (case-insensitive)

  // Build sorted SKU list (longest first to avoid prefix collisions)
  const skus = [...skuToVariant.keys()].sort((a, b) => b.length - a.length);

  // Map: variantId → sorted list of { key, index }
  const variantFiles = new Map();

  for (const key of keys) {
    const baseName = key.replace("product-images/", "").replace(/\.webp$|\.png$/i, "");
    const baseNameLower = baseName.toLowerCase();

    // Find matching SKU
    let matchedSku = null;
    let imgIndex = 0;

    for (const sku of skus) {
      if (baseNameLower === sku) {
        matchedSku = sku;
        imgIndex = 0;
        break;
      }
      // Check pattern: {sku}-{number}
      const suffix = baseNameLower.slice(sku.length);
      if (baseNameLower.startsWith(sku) && /^-\d+$/.test(suffix)) {
        matchedSku = sku;
        imgIndex = parseInt(suffix.slice(1), 10);
        break;
      }
    }

    if (!matchedSku) {
      console.log(`   ⚠️  Sin variante: ${key}`);
      continue;
    }

    const variant = skuToVariant.get(matchedSku);
    if (!variantFiles.has(variant.id)) variantFiles.set(variant.id, []);
    variantFiles.get(variant.id).push({ key, index: imgIndex });
  }

  console.log(`   ${variantFiles.size} variantes con archivos encontrados`);
  console.log(`   ${keys.length - [...variantFiles.values()].flat().length} archivos sin variante\n`);

  // 4. Delete existing product_images (keep the 7 that may already exist correctly)
  // Actually, insert only for variants that have 0 images
  const { data: existing } = await supabase.from("product_images").select("variant_id");
  const variantsWithImages = new Set(existing?.map((r) => r.variant_id) ?? []);
  console.log(`   ${variantsWithImages.size} variantes ya tienen imágenes (se omiten)\n`);

  // 5. Insert records
  let inserted = 0;
  let skippedVariants = 0;

  for (const [variantId, files] of variantFiles) {
    if (variantsWithImages.has(variantId)) { skippedVariants++; continue; }

    // Sort by index
    files.sort((a, b) => a.index - b.index);

    const rows = files.map((f, position) => ({
      variant_id: variantId,
      url: `${S3_BASE}/${f.key}`,
      is_primary: position === 0,
      sort_order: position,
    }));

    const { error } = await supabase.from("product_images").insert(rows);
    if (error) {
      console.warn(`   ⚠️  Error insertando ${variantId}: ${error.message}`);
    } else {
      inserted += rows.length;
    }
  }

  console.log(`✅ Listo.`);
  console.log(`   ${inserted} registros insertados`);
  console.log(`   ${skippedVariants} variantes omitidas (ya tenían imágenes)`);
})();
