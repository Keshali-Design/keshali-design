# Graph Report - keshali-design  (2026-11-10)

## Corpus Check
- 92 files · ~220,733 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 429 nodes · 731 edges · 58 communities (36 shown, 22 thin omitted)
- Extraction: 100% EXTRACTED · 0% INFERRED · 0% AMBIGUOUS
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `0ab3c740`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)
- [[_COMMUNITY_Category Admin Actions|Category Admin Actions]]
- [[_COMMUNITY_Admin Panel Core (InventorySizes)|Admin Panel Core (Inventory/Sizes)]]
- [[_COMMUNITY_Public Layout & Catalog Metadata|Public Layout & Catalog Metadata]]
- [[_COMMUNITY_Checkout & Auth Flow|Checkout & Auth Flow]]
- [[_COMMUNITY_Community 4|Community 4]]
- [[_COMMUNITY_Product & Variant Editing|Product & Variant Editing]]
- [[_COMMUNITY_AWSPackage Dependencies|AWS/Package Dependencies]]
- [[_COMMUNITY_StockManager.tsx|StockManager.tsx]]
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
- [[_COMMUNITY_Rebuild Product Images Script|Rebuild Product Images Script]]
- [[_COMMUNITY_Nosotros Page (dup A)|Nosotros Page (dup A)]]
- [[_COMMUNITY_Nosotros Page (dup B)|Nosotros Page (dup B)]]
- [[_COMMUNITY_Proxy Config (dup A)|Proxy Config (dup A)]]
- [[_COMMUNITY_route.ts|route.ts]]
- [[_COMMUNITY_inventory.ts|inventory.ts]]
- [[_COMMUNITY_CLAUDE|CLAUDE.md]]
- [[_COMMUNITY_layout.tsx|layout.tsx]]
- [[_COMMUNITY_metadata|metadata]]
- [[_COMMUNITY_metadata|metadata]]
- [[_COMMUNITY_page.tsx|page.tsx]]
- [[_COMMUNITY_layout.tsx|layout.tsx]]
- [[_COMMUNITY_graphify-outgraph.json|graphify-out/graph.json]]
- [[_COMMUNITY_graphify-outGRAPH_REPORT|graphify-out/GRAPH_REPORT.md]]
- [[_COMMUNITY_graphify explain Command|graphify explain Command]]
- [[_COMMUNITY_graphify path Command|graphify path Command]]
- [[_COMMUNITY_graphify query Command|graphify query Command]]
- [[_COMMUNITY_graphify update Command|graphify update Command]]
- [[_COMMUNITY_graphify-outwikiindex|graphify-out/wiki/index.md]]
- [[_COMMUNITY_GRADIENTS|GRADIENTS]]

## God Nodes (most connected - your core abstractions)
1. `createAdminClient()` - 57 edges
2. `formatCOP()` - 28 edges
3. `compilerOptions` - 16 edges
4. `catalogUrl()` - 13 edges
5. `useCart` - 9 edges
6. `getCategories` - 8 edges
7. `CatalogoPage()` - 7 edges
8. `sitemap()` - 7 edges
9. `absoluteUrl()` - 7 edges
10. `getCatalogProducts()` - 7 edges

## Surprising Connections (you probably didn't know these)
- `NuevoPedidoPage()` --calls--> `createAdminClient()`  [EXTRACTED]
  app/admin/pedidos/nuevo/page.tsx → lib/supabase/admin.ts
- `EditProductPage()` --calls--> `createAdminClient()`  [EXTRACTED]
  app/admin/productos/[id]/page.tsx → lib/supabase/admin.ts
- `NuevoProductoPage()` --calls--> `createAdminClient()`  [EXTRACTED]
  app/admin/productos/nuevo/page.tsx → lib/supabase/admin.ts
- `StockPage()` --calls--> `createAdminClient()`  [EXTRACTED]
  app/admin/stock/page.tsx → lib/supabase/admin.ts
- `EditVariantFullForm()` --calls--> `formatCOP()`  [EXTRACTED]
  components/admin/EditVariantFullForm.tsx → lib/utils.ts

## Import Cycles
- 3-file cycle: `app/admin/pedidos/nuevo/page.tsx -> components/admin/NuevoPedidoForm.tsx -> components/admin/VariantCombobox.tsx -> app/admin/pedidos/nuevo/page.tsx`

## Hyperedges (group relationships)
- **Keshali Design Visual Identity System** — public_hero_banner_image, public_logo_image, keshali_design_brand, keshali_design_tagline [INFERRED 0.85]

## Communities (58 total, 22 thin omitted)

### Community 0 - "Category Admin Actions"
Cohesion: 0.10
Nodes (40): PriceFilter(), CatalogSidebar(), SizeGroup, CatalogParams, catalogUrl(), ORDER, CatalogoPage(), generateMetadata() (+32 more)

### Community 1 - "Admin Panel Core (Inventory/Sizes)"
Cohesion: 0.06
Nodes (29): AdminDashboardPage(), DAY_LABELS, AdminPedidosPage(), OrderItemRow, OrderWithItems, variantLabel(), AdminSidebar(), NAV (+21 more)

### Community 2 - "Public Layout & Catalog Metadata"
Cohesion: 0.11
Nodes (23): metadata, NuevoPedidoPage(), VariantOpt, AdminProductosPage(), ProductRow, CheckoutPage(), getVariantPrice(), ItemRow (+15 more)

### Community 3 - "Checkout & Auth Flow"
Cohesion: 0.06
Nodes (32): dependencies, @aws-sdk/client-s3, clsx, lucide-react, next, react, react-dom, resend (+24 more)

### Community 4 - "Community 4"
Cohesion: 0.27
Nodes (6): getPaymentResult(), PaymentResult, wompiApiBase(), ResultadoContent(), Status, STATUS_CONFIG

### Community 5 - "Product & Variant Editing"
Cohesion: 0.15
Nodes (16): autoSku(), createProduct(), deleteProduct(), ProductColorInput, ProductSizeInput, toSlug(), VariantSkuOverride, CategoryOpt (+8 more)

### Community 6 - "AWS/Package Dependencies"
Cohesion: 0.16
Nodes (17): updateProduct(), addVariantImages(), deleteVariantImage(), updateVariantFull(), EditProductPage(), metadata, ProductFull, VariantWithImages (+9 more)

### Community 7 - "StockManager.tsx"
Cohesion: 0.25
Nodes (9): CategoryOpt, ColorOpt, InventoryRow, metadata, SizeOpt, StockPage(), InventoryEntry, Slot (+1 more)

### Community 8 - "Community 8"
Cohesion: 0.13
Nodes (22): updateOrderStatus(), createManualOrder(), ManualOrderInput, ManualOrderItem, POST(), CatalogRow, CheckoutInput, CheckoutItem (+14 more)

### Community 9 - "Community 9"
Cohesion: 0.10
Nodes (19): compilerOptions, allowJs, esModuleInterop, incremental, isolatedModules, jsx, lib, module (+11 more)

### Community 10 - "Admin Dashboard & Orders List"
Cohesion: 0.10
Nodes (35): createCategory(), createSubcategory(), deleteCategoryImage(), setCategoryColors(), setCategoryImage(), setCategorySizes(), toggleCategory(), toggleCategoryColor() (+27 more)

### Community 11 - "Community 11"
Cohesion: 0.14
Nodes (10): archivo, metadata, organizationLd, Footer(), Header(), NAV_LINKS, JsonLd(), SITE_KEYWORDS (+2 more)

### Community 12 - "Product Deletion & Creation Flow"
Cohesion: 0.35
Nodes (10): __dirname, downloadFile(), envPath, listAllFiles(), migrateCategoryImages(), migrateProductImages(), s3, s3Url() (+2 more)

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
- **140 isolated node(s):** `metadata`, `ORDER`, `Props`, `TECHNIQUES`, `metadata` (+135 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **22 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `createAdminClient()` connect `Admin Dashboard & Orders List` to `Admin Panel Core (Inventory/Sizes)`, `Public Layout & Catalog Metadata`, `Product & Variant Editing`, `AWS/Package Dependencies`, `StockManager.tsx`, `Community 8`?**
  _High betweenness centrality (0.132) - this node is a cross-community bridge._
- **Why does `formatCOP()` connect `Public Layout & Catalog Metadata` to `Admin Panel Core (Inventory/Sizes)`, `Product & Variant Editing`, `AWS/Package Dependencies`, `StockManager.tsx`, `Community 8`?**
  _High betweenness centrality (0.126) - this node is a cross-community bridge._
- **Why does `ProductDetail` connect `Category Admin Actions` to `Public Layout & Catalog Metadata`?**
  _High betweenness centrality (0.025) - this node is a cross-community bridge._
- **What connects `metadata`, `ORDER`, `Props` to the rest of the system?**
  _144 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `Category Admin Actions` be split into smaller, more focused modules?**
  _Cohesion score 0.09954751131221719 - nodes in this community are weakly interconnected._
- **Should `Admin Panel Core (Inventory/Sizes)` be split into smaller, more focused modules?**
  _Cohesion score 0.06341463414634146 - nodes in this community are weakly interconnected._
- **Should `Public Layout & Catalog Metadata` be split into smaller, more focused modules?**
  _Cohesion score 0.11260504201680673 - nodes in this community are weakly interconnected._