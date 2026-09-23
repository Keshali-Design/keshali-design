# Graph Report - .  (2026-09-22)

## Corpus Check
- 163 files · ~250,000 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 394 nodes · 842 edges · 25 communities (18 shown, 7 thin omitted)
- Extraction: 100% EXTRACTED · 0% INFERRED · 0% AMBIGUOUS
- Token cost: 0 input · 0 output

## Community Hubs (Navigation)
- [[_COMMUNITY_Category Admin Actions|Category Admin Actions]]
- [[_COMMUNITY_Admin Panel Core (InventorySizes)|Admin Panel Core (Inventory/Sizes)]]
- [[_COMMUNITY_Public Layout & Catalog Metadata|Public Layout & Catalog Metadata]]
- [[_COMMUNITY_Checkout & Auth Flow|Checkout & Auth Flow]]
- [[_COMMUNITY_Community 4|Community 4]]
- [[_COMMUNITY_Product & Variant Editing|Product & Variant Editing]]
- [[_COMMUNITY_AWSPackage Dependencies|AWS/Package Dependencies]]
- [[_COMMUNITY_Community 7|Community 7]]
- [[_COMMUNITY_Community 8|Community 8]]
- [[_COMMUNITY_Community 9|Community 9]]
- [[_COMMUNITY_Admin Dashboard & Orders List|Admin Dashboard & Orders List]]
- [[_COMMUNITY_Community 11|Community 11]]
- [[_COMMUNITY_Product Deletion & Creation Flow|Product Deletion & Creation Flow]]
- [[_COMMUNITY_Product Actions (SKUSlug)|Product Actions (SKU/Slug)]]
- [[_COMMUNITY_Community 14|Community 14]]
- [[_COMMUNITY_tsconfig Duplicate|tsconfig Duplicate]]
- [[_COMMUNITY_Community 16|Community 16]]
- [[_COMMUNITY_S3 Image Migration Script|S3 Image Migration Script]]
- [[_COMMUNITY_Community 18|Community 18]]
- [[_COMMUNITY_DB Image URL Fix Script|DB Image URL Fix Script]]
- [[_COMMUNITY_Rebuild Product Images Script|Rebuild Product Images Script]]
- [[_COMMUNITY_Nosotros Page (dup A)|Nosotros Page (dup A)]]
- [[_COMMUNITY_Nosotros Page (dup B)|Nosotros Page (dup B)]]
- [[_COMMUNITY_Proxy Config (dup A)|Proxy Config (dup A)]]

## God Nodes (most connected - your core abstractions)
1. `createAdminClient()` - 66 edges
2. `formatCOP()` - 33 edges
3. `compilerOptions` - 16 edges
4. `createClient()` - 11 edges
5. `useCart` - 10 edges
6. `CategoriasManager()` - 9 edges
7. `getCategories()` - 8 edges
8. `getCatalogProducts()` - 8 edges
9. `deleteVariantImage()` - 7 edges
10. `addVariantImages()` - 7 edges

## Surprising Connections (you probably didn't know these)
- `AdminDashboardPage()` --calls--> `createAdminClient()`  [EXTRACTED]
  app/admin/page.tsx → lib/supabase/admin.ts
- `AdminDashboardPage()` --calls--> `formatCOP()`  [EXTRACTED]
  app/admin/page.tsx → lib/utils.ts
- `updateOrderStatus()` --calls--> `createAdminClient()`  [EXTRACTED]
  app/admin/pedidos/actions.ts → lib/supabase/admin.ts
- `AdminPedidosPage()` --calls--> `createAdminClient()`  [EXTRACTED]
  app/admin/pedidos/page.tsx → lib/supabase/admin.ts
- `AdminPedidosPage()` --calls--> `formatCOP()`  [EXTRACTED]
  app/admin/pedidos/page.tsx → lib/utils.ts

## Import Cycles
- 2-file cycle: `app/admin/tamanos/page.tsx -> components/admin/TamanosManager.tsx -> app/admin/tamanos/page.tsx`
- 2-file cycle: `app/admin/stock/page.tsx -> components/admin/StockManager.tsx -> app/admin/stock/page.tsx`
- 2-file cycle: `app/admin/productos/nuevo/page.tsx -> components/admin/NuevoProductoForm.tsx -> app/admin/productos/nuevo/page.tsx`
- 2-file cycle: `app/admin/productos/[id]/page.tsx -> components/admin/EditProductForm.tsx -> app/admin/productos/[id]/page.tsx`
- 2-file cycle: `app/admin/categorias/page.tsx -> components/admin/CategoriasManager.tsx -> app/admin/categorias/page.tsx`
- 2-file cycle: `app/admin/pedidos/nuevo/page.tsx -> components/admin/NuevoPedidoForm.tsx -> app/admin/pedidos/nuevo/page.tsx`
- 3-file cycle: `app/admin/pedidos/nuevo/page.tsx -> components/admin/NuevoPedidoForm.tsx -> components/admin/VariantCombobox.tsx -> app/admin/pedidos/nuevo/page.tsx`

## Hyperedges (group relationships)
- **Keshali Design Visual Identity System** — public_hero_banner_image, public_logo_image, keshali_design_brand, keshali_design_tagline [INFERRED 0.85]

## Communities (25 total, 7 thin omitted)

### Community 0 - "Category Admin Actions"
Cohesion: 0.09
Nodes (35): AdminLayout(), metadata, CatalogoPage(), metadata, Props, TECHNIQUES, SubcategorySelect(), HomePage() (+27 more)

### Community 1 - "Admin Panel Core (Inventory/Sizes)"
Cohesion: 0.08
Nodes (35): AdminDashboardPage(), DAY_LABELS, StatusBadge(), AdminPedidosPage(), OrderItemRow, OrderWithItems, variantLabel(), toggleVariantActive() (+27 more)

### Community 2 - "Public Layout & Catalog Metadata"
Cohesion: 0.12
Nodes (19): AdminLoginPage(), LoadingSpinner(), ResultadoContent(), ResultadoPage(), Status, STATUS_CONFIG, archivo, metadata (+11 more)

### Community 3 - "Checkout & Auth Flow"
Cohesion: 0.06
Nodes (32): dependencies, @aws-sdk/client-s3, clsx, lucide-react, next, react, react-dom, resend (+24 more)

### Community 4 - "Community 4"
Cohesion: 0.19
Nodes (23): createCategory(), createSubcategory(), deleteCategoryImage(), setCategoryColors(), setCategoryImage(), setCategorySizes(), toggleCategory(), toggleCategoryColor() (+15 more)

### Community 5 - "Product & Variant Editing"
Cohesion: 0.15
Nodes (19): autoSku(), createProduct(), deleteProduct(), ProductColorInput, ProductSizeInput, toSlug(), VariantSkuOverride, CategoryOpt (+11 more)

### Community 6 - "AWS/Package Dependencies"
Cohesion: 0.18
Nodes (16): updateProduct(), addVariantImages(), deleteVariantImage(), updateVariantFull(), EditProductPage(), metadata, ProductFull, VariantWithImages (+8 more)

### Community 7 - "Community 7"
Cohesion: 0.15
Nodes (14): createManualOrder(), ManualOrderInput, ManualOrderItem, POST(), CatalogRow, CheckoutInput, CheckoutItem, createOrder() (+6 more)

### Community 8 - "Community 8"
Cohesion: 0.18
Nodes (15): metadata, NuevoPedidoPage(), metadata, VariantOpt, CatalogFilters(), EditVariantFullForm(), getVariantPrice(), ItemRow (+7 more)

### Community 9 - "Community 9"
Cohesion: 0.10
Nodes (19): compilerOptions, allowJs, esModuleInterop, incremental, isolatedModules, jsx, lib, module (+11 more)

### Community 10 - "Admin Dashboard & Orders List"
Cohesion: 0.30
Nodes (11): createSize(), createSizeType(), toggleSize(), toggleSizeType(), updateSize(), ErrorCard(), metadata, Size (+3 more)

### Community 11 - "Community 11"
Cohesion: 0.35
Nodes (9): updateOrderStatus(), STATUSES, getResend(), OrderEmailData, orderEmailHtml(), sendNewOrderNotification(), sendOrderConfirmationToCustomer(), sendOrderDeliveredEmail() (+1 more)

### Community 12 - "Product Deletion & Creation Flow"
Cohesion: 0.35
Nodes (10): __dirname, downloadFile(), envPath, listAllFiles(), migrateCategoryImages(), migrateProductImages(), s3, s3Url() (+2 more)

### Community 13 - "Product Actions (SKU/Slug)"
Cohesion: 0.25
Nodes (9): Keshali Design CLAUDE.md (Graphify Instructions), graphify-out/graph.json, graphify-out/GRAPH_REPORT.md, graphify explain Command, graphify path Command, graphify query Command, graphify update Command, graphify-out/wiki/index.md (+1 more)

### Community 14 - "Community 14"
Cohesion: 0.29
Nodes (4): __dirname, envPath, lines, supabase

### Community 15 - "tsconfig Duplicate"
Cohesion: 0.33
Nodes (4): __dirname, lines, s3, supabase

### Community 17 - "S3 Image Migration Script"
Cohesion: 0.83
Nodes (4): Keshali Design Brand Identity, 'Tu esencia en cada diseño' Tagline, Keshali Design Hero Banner, Keshali Design Circular Logo

## Knowledge Gaps
- **113 isolated node(s):** `ManualOrderItem`, `ManualOrderInput`, `CheckoutItem`, `CheckoutInput`, `CatalogRow` (+108 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **7 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `createAdminClient()` connect `Community 4` to `Admin Panel Core (Inventory/Sizes)`, `Product & Variant Editing`, `AWS/Package Dependencies`, `Community 8`, `Admin Dashboard & Orders List`, `Community 11`?**
  _High betweenness centrality (0.143) - this node is a cross-community bridge._
- **Why does `formatCOP()` connect `Community 8` to `Category Admin Actions`, `Admin Panel Core (Inventory/Sizes)`, `Public Layout & Catalog Metadata`, `Product & Variant Editing`, `AWS/Package Dependencies`, `Community 11`?**
  _High betweenness centrality (0.133) - this node is a cross-community bridge._
- **What connects `ManualOrderItem`, `ManualOrderInput`, `CheckoutItem` to the rest of the system?**
  _116 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `Category Admin Actions` be split into smaller, more focused modules?**
  _Cohesion score 0.09351432880844646 - nodes in this community are weakly interconnected._
- **Should `Admin Panel Core (Inventory/Sizes)` be split into smaller, more focused modules?**
  _Cohesion score 0.07536231884057971 - nodes in this community are weakly interconnected._
- **Should `Public Layout & Catalog Metadata` be split into smaller, more focused modules?**
  _Cohesion score 0.12121212121212122 - nodes in this community are weakly interconnected._
- **Should `Checkout & Auth Flow` be split into smaller, more focused modules?**
  _Cohesion score 0.06060606060606061 - nodes in this community are weakly interconnected._