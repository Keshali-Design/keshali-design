/**
 * Migrates images from Supabase Storage → AWS S3
 * and updates the URLs in the database.
 *
 * Run: node scripts/migrate-images-to-s3.mjs
 * Requires env vars: NEXT_PUBLIC_SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY,
 *                    AWS_ACCESS_KEY_ID, AWS_SECRET_ACCESS_KEY, AWS_REGION, AWS_S3_BUCKET
 */

import { createClient } from "@supabase/supabase-js";
import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import { readFileSync } from "fs";
import { resolve, dirname } from "path";
import { fileURLToPath } from "url";

// ── Load .env.local manually ──────────────────────────────────
const __dirname = dirname(fileURLToPath(import.meta.url));
const envPath = resolve(__dirname, "../.env");
try {
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
  console.log("✓ .env.local cargado");
} catch {
  console.error("⚠️  Could not read .env.local — make sure env vars are set.");
}

// ── Clients ───────────────────────────────────────────────────
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
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;

function s3Url(key) {
  return `https://${BUCKET}.s3.${process.env.AWS_REGION}.amazonaws.com/${key}`;
}

// ── Helpers ───────────────────────────────────────────────────
async function listAllFiles(bucket, folder = "") {
  const { data, error } = await supabase.storage.from(bucket).list(folder, { limit: 1000 });
  if (error) throw new Error(`list ${bucket}/${folder}: ${error.message}`);
  return (data ?? []).filter((f) => f.name !== ".emptyFolderPlaceholder");
}

async function downloadFile(bucket, path) {
  const { data, error } = await supabase.storage.from(bucket).download(path);
  if (error) throw new Error(`download ${bucket}/${path}: ${error.message}`);
  return Buffer.from(await data.arrayBuffer());
}

async function uploadToS3(key, buffer, contentType) {
  await s3.send(new PutObjectCommand({
    Bucket: BUCKET,
    Key: key,
    Body: buffer,
    ContentType: contentType,
  }));
  return s3Url(key);
}

// ── Migration: product-images ─────────────────────────────────
async function migrateProductImages() {
  console.log("\n📦 Migrando product-images...");
  const files = await listAllFiles("product-images");
  console.log(`   ${files.length} archivos encontrados`);

  for (const file of files) {
    const supabasePath = file.name;
    const s3Key = `product-images/${file.name}`;
    const oldUrl = `${SUPABASE_URL}/storage/v1/object/public/product-images/${file.name}`;
    const newUrl = s3Url(s3Key);

    process.stdout.write(`   → ${file.name} ... `);

    try {
      const buffer = await downloadFile("product-images", supabasePath);
      await uploadToS3(s3Key, buffer, "image/webp");

      // Update product_images table
      const { error } = await supabase
        .from("product_images")
        .update({ url: newUrl })
        .eq("url", oldUrl);

      if (error) console.warn(`\n     ⚠️  DB update: ${error.message}`);
      else console.log("✓");
    } catch (e) {
      console.log(`✗ ${e.message}`);
    }
  }
}

// ── Migration: category-images ────────────────────────────────
async function migrateCategoryImages() {
  console.log("\n🗂️  Migrando category-images...");
  const files = await listAllFiles("category-images");
  console.log(`   ${files.length} archivos encontrados`);

  for (const file of files) {
    const supabasePath = file.name;
    const s3Key = `category-images/${file.name}`;
    const oldUrl = `${SUPABASE_URL}/storage/v1/object/public/category-images/${file.name}`;
    const newUrl = s3Url(s3Key);

    process.stdout.write(`   → ${file.name} ... `);

    try {
      const buffer = await downloadFile("category-images", supabasePath);
      await uploadToS3(s3Key, buffer, "image/webp");

      // Update categories table
      const { error } = await supabase
        .from("categories")
        .update({ image_url: newUrl })
        .eq("image_url", oldUrl);

      if (error) console.warn(`\n     ⚠️  DB update: ${error.message}`);
      else console.log("✓");
    } catch (e) {
      console.log(`✗ ${e.message}`);
    }
  }
}

// ── Run ───────────────────────────────────────────────────────
(async () => {
  console.log("🚀 Iniciando migración Supabase Storage → S3");
  console.log(`   Bucket: ${BUCKET}`);
  console.log(`   Región: ${process.env.AWS_REGION}`);

  await migrateProductImages();
  await migrateCategoryImages();

  console.log("\n✅ Migración completa.");
})();
