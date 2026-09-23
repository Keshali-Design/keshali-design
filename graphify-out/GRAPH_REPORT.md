# Graph Report - .  (2026-09-22)

## Corpus Check
- 81 files · ~250,000 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 659 nodes · 1216 edges · 43 communities (32 shown, 11 thin omitted)
- Extraction: 100% EXTRACTED · 0% INFERRED · 0% AMBIGUOUS
- Token cost: 0 input · 0 output

## Community Hubs (Navigation)
- [[_COMMUNITY_Category Admin Actions|Category Admin Actions]]
- [[_COMMUNITY_Admin Panel Core (InventorySizes)|Admin Panel Core (Inventory/Sizes)]]
- [[_COMMUNITY_Public Layout & Catalog Metadata|Public Layout & Catalog Metadata]]
- [[_COMMUNITY_Checkout & Auth Flow|Checkout & Auth Flow]]
- [[_COMMUNITY_Catalog Browsing UI|Catalog Browsing UI]]
- [[_COMMUNITY_Product & Variant Editing|Product & Variant Editing]]
- [[_COMMUNITY_AWSPackage Dependencies|AWS/Package Dependencies]]
- [[_COMMUNITY_Supabase Package Dependencies|Supabase Package Dependencies]]
- [[_COMMUNITY_Admin Sidebar & Supabase Clients|Admin Sidebar & Supabase Clients]]
- [[_COMMUNITY_Order Status API|Order Status API]]
- [[_COMMUNITY_Admin Dashboard & Orders List|Admin Dashboard & Orders List]]
- [[_COMMUNITY_Checkout & Site Chrome|Checkout & Site Chrome]]
- [[_COMMUNITY_Product Deletion & Creation Flow|Product Deletion & Creation Flow]]
- [[_COMMUNITY_Product Actions (SKUSlug)|Product Actions (SKU/Slug)]]
- [[_COMMUNITY_TypeScript Compiler Options|TypeScript Compiler Options]]
- [[_COMMUNITY_tsconfig Duplicate|tsconfig Duplicate]]
- [[_COMMUNITY_Manual Order Creation|Manual Order Creation]]
- [[_COMMUNITY_S3 Image Migration Script|S3 Image Migration Script]]
- [[_COMMUNITY_Graphify Meta Docs|Graphify Meta Docs]]
- [[_COMMUNITY_DB Image URL Fix Script|DB Image URL Fix Script]]
- [[_COMMUNITY_Rebuild Product Images Script|Rebuild Product Images Script]]
- [[_COMMUNITY_Keshali Brand Identity (LogoHero)|Keshali Brand Identity (Logo/Hero)]]
- [[_COMMUNITY_Nosotros Page (dup A)|Nosotros Page (dup A)]]
- [[_COMMUNITY_Nosotros Page (dup B)|Nosotros Page (dup B)]]
- [[_COMMUNITY_Proxy Config (dup A)|Proxy Config (dup A)]]
- [[_COMMUNITY_Proxy Config (dup B)|Proxy Config (dup B)]]
- [[_COMMUNITY_Login Layout (dup A)|Login Layout (dup A)]]
- [[_COMMUNITY_Login Layout (dup B)|Login Layout (dup B)]]
- [[_COMMUNITY_Tamanos Error (dup A)|Tamanos Error (dup A)]]
- [[_COMMUNITY_Tamanos Error (dup B)|Tamanos Error (dup B)]]
- [[_COMMUNITY_Contacto Page (dup A)|Contacto Page (dup A)]]
- [[_COMMUNITY_Tailwind Config (dup B)|Tailwind Config (dup B)]]
- [[_COMMUNITY_Community 38|Community 38]]
- [[_COMMUNITY_Community 39|Community 39]]
- [[_COMMUNITY_Community 40|Community 40]]
- [[_COMMUNITY_Community 41|Community 41]]
- [[_COMMUNITY_Community 42|Community 42]]

## God Nodes (most connected - your core abstractions)
1. `createAdminClient()` - 57 edges
2. `formatCOP()` - 55 edges
3. `createAdminClient()` - 55 edges
4. `compilerOptions` - 16 edges
5. `compilerOptions` - 16 edges
6. `useCart` - 11 edges
7. `useCart` - 11 edges
8. `createClient()` - 10 edges
9. `sendNewOrderNotification()` - 9 edges
10. `sendOrderConfirmationToCustomer()` - 8 edges

## Surprising Connections (you probably didn't know these)
- `AdminDashboardPage()` --calls--> `createAdminClient()`  [EXTRACTED]
  app/admin/page.tsx → lib/supabase/admin.ts
- `AdminPedidosPage()` --calls--> `createAdminClient()`  [EXTRACTED]
  app/admin/pedidos/page.tsx → lib/supabase/admin.ts
- `NuevoPedidoPage()` --calls--> `createAdminClient()`  [EXTRACTED]
  app/admin/pedidos/nuevo/page.tsx → lib/supabase/admin.ts
- `AdminProductosPage()` --calls--> `createAdminClient()`  [EXTRACTED]
  app/admin/productos/page.tsx → lib/supabase/admin.ts
- `NuevoProductoPage()` --calls--> `createAdminClient()`  [EXTRACTED]
  app/admin/productos/nuevo/page.tsx → lib/supabase/admin.ts

## Import Cycles
- 2-file cycle: `app/admin/tamanos/page.tsx -> components/admin/TamanosManager.tsx -> app/admin/tamanos/page.tsx`
- 2-file cycle: `app/admin/stock/page.tsx -> components/admin/StockManager.tsx -> app/admin/stock/page.tsx`
- 2-file cycle: `app/admin/productos/nuevo/page.tsx -> components/admin/NuevoProductoForm.tsx -> app/admin/productos/nuevo/page.tsx`
- 2-file cycle: `app/admin/productos/[id]/page.tsx -> components/admin/EditProductForm.tsx -> app/admin/productos/[id]/page.tsx`
- 2-file cycle: `app/admin/pedidos/nuevo/page.tsx -> components/admin/NuevoPedidoForm.tsx -> app/admin/pedidos/nuevo/page.tsx`
- 2-file cycle: `app/admin/categorias/page.tsx -> components/admin/CategoriasManager.tsx -> app/admin/categorias/page.tsx`
- 3-file cycle: `app/admin/pedidos/nuevo/page.tsx -> components/admin/NuevoPedidoForm.tsx -> components/admin/VariantCombobox.tsx -> app/admin/pedidos/nuevo/page.tsx`

## Hyperedges (group relationships)
- **Keshali Design Visual Identity System** — public_hero_banner_image, public_logo_image, keshali_design_brand, keshali_design_tagline [INFERRED 0.85]

## Communities (43 total, 11 thin omitted)

### Community 0 - "Category Admin Actions"
Cohesion: 0.05
Nodes (65): createCategory(), createSubcategory(), deleteCategoryImage(), setCategoryColors(), setCategoryImage(), setCategorySizes(), toggleCategory(), toggleCategoryColor() (+57 more)

### Community 1 - "Admin Panel Core (Inventory/Sizes)"
Cohesion: 0.08
Nodes (36): AdminLayout(), metadata, CatalogFilters(), CatalogoPage(), metadata, Props, TECHNIQUES, SubcategorySelect() (+28 more)

### Community 2 - "Public Layout & Catalog Metadata"
Cohesion: 0.10
Nodes (30): updateOrderStatus(), createManualOrder(), ManualOrderInput, ManualOrderItem, POST(), CatalogRow, CheckoutInput, CheckoutItem (+22 more)

### Community 3 - "Checkout & Auth Flow"
Cohesion: 0.06
Nodes (28): AdminSidebar(), NAV, metadata, OrderStatusSelect(), STATUSES, AdminDashboardPage(), AdminPedidosPage(), OrderItemRow (+20 more)

### Community 4 - "Catalog Browsing UI"
Cohesion: 0.10
Nodes (26): HomePage(), CatalogoPage(), metadata, Props, SubcategorySelect(), generateMetadata(), ProductPage(), Props (+18 more)

### Community 5 - "Product & Variant Editing"
Cohesion: 0.07
Nodes (25): AdminDashboardPage(), DAY_LABELS, AdminPedidosPage(), OrderItemRow, OrderWithItems, variantLabel(), OrderStatusSelect(), STATUSES (+17 more)

### Community 6 - "AWS/Package Dependencies"
Cohesion: 0.06
Nodes (32): dependencies, @aws-sdk/client-s3, clsx, lucide-react, next, react, react-dom, resend (+24 more)

### Community 7 - "Supabase Package Dependencies"
Cohesion: 0.06
Nodes (31): dependencies, clsx, lucide-react, next, react, react-dom, resend, sharp (+23 more)

### Community 8 - "Admin Sidebar & Supabase Clients"
Cohesion: 0.13
Nodes (14): metadata, RootLayout(), CheckoutPage(), Footer(), Header(), NAV_LINKS, ResultadoContent(), Status (+6 more)

### Community 9 - "Order Status API"
Cohesion: 0.21
Nodes (19): CategoriasManager(), createCategory(), createSubcategory(), setCategoryColors(), setCategorySizes(), toggleCategory(), toggleCategoryColor(), toggleCategorySize() (+11 more)

### Community 10 - "Admin Dashboard & Orders List"
Cohesion: 0.14
Nodes (12): CheckoutPage(), ResultadoContent(), Status, STATUS_CONFIG, archivo, Footer(), Header(), NAV_LINKS (+4 more)

### Community 11 - "Checkout & Site Chrome"
Cohesion: 0.10
Nodes (19): compilerOptions, allowJs, esModuleInterop, incremental, isolatedModules, jsx, lib, module (+11 more)

### Community 12 - "Product Deletion & Creation Flow"
Cohesion: 0.10
Nodes (19): compilerOptions, allowJs, esModuleInterop, incremental, isolatedModules, jsx, lib, module (+11 more)

### Community 13 - "Product Actions (SKU/Slug)"
Cohesion: 0.20
Nodes (13): EditProductForm(), ProductHeader(), VariantCard(), EditVariantFullForm(), Image, addVariantImages(), deleteVariantImage(), updateVariantFull() (+5 more)

### Community 14 - "TypeScript Compiler Options"
Cohesion: 0.18
Nodes (13): getVariantPrice(), ItemRow, NuevoPedidoForm(), STATUSES, getVariantLabel(), getVariantPrice(), VariantCombobox(), metadata (+5 more)

### Community 15 - "tsconfig Duplicate"
Cohesion: 0.18
Nodes (14): autoSku(), createProduct(), ProductColorInput, ProductSizeInput, toSlug(), VariantSkuOverride, CategoryOpt, ColorOpt (+6 more)

### Community 16 - "Manual Order Creation"
Cohesion: 0.19
Nodes (11): InventoryEntry, Slot, StockManager(), toggleVariantActive(), upsertInventory(), CategoryOpt, ColorOpt, InventoryRow (+3 more)

### Community 17 - "S3 Image Migration Script"
Cohesion: 0.23
Nodes (10): TamanosManager(), createSize(), createSizeType(), toggleSize(), toggleSizeType(), updateSize(), metadata, Size (+2 more)

### Community 18 - "Graphify Meta Docs"
Cohesion: 0.21
Nodes (10): DeleteProductButton(), autoSku(), createProduct(), deleteProduct(), ProductColorInput, ProductSizeInput, toSlug(), VariantSkuOverride (+2 more)

### Community 19 - "DB Image URL Fix Script"
Cohesion: 0.26
Nodes (10): metadata, NuevoPedidoPage(), VariantOpt, getVariantPrice(), ItemRow, NuevoPedidoForm(), STATUSES, getVariantLabel() (+2 more)

### Community 20 - "Rebuild Product Images Script"
Cohesion: 0.35
Nodes (10): __dirname, downloadFile(), envPath, listAllFiles(), migrateCategoryImages(), migrateProductImages(), s3, s3Url() (+2 more)

### Community 21 - "Keshali Brand Identity (Logo/Hero)"
Cohesion: 0.31
Nodes (8): NuevoProductoForm(), Step, metadata, CategoryOpt, ColorOpt, NuevoProductoPage(), SizeOpt, SubcategoryOpt

### Community 22 - "Nosotros Page (dup A)"
Cohesion: 0.25
Nodes (9): Keshali Design CLAUDE.md (Graphify Instructions), graphify-out/graph.json, graphify-out/GRAPH_REPORT.md, graphify explain Command, graphify path Command, graphify query Command, graphify update Command, graphify-out/wiki/index.md (+1 more)

### Community 23 - "Nosotros Page (dup B)"
Cohesion: 0.29
Nodes (4): __dirname, envPath, lines, supabase

### Community 24 - "Proxy Config (dup A)"
Cohesion: 0.33
Nodes (4): __dirname, lines, s3, supabase

### Community 26 - "Login Layout (dup A)"
Cohesion: 0.83
Nodes (4): Keshali Design Brand Identity, 'Tu esencia en cada diseño' Tagline, Keshali Design Hero Banner, Keshali Design Circular Logo

## Knowledge Gaps
- **231 isolated node(s):** `nextConfig`, `name`, `version`, `private`, `dev` (+226 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **11 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `formatCOP()` connect `Public Layout & Catalog Metadata` to `Category Admin Actions`, `Admin Panel Core (Inventory/Sizes)`, `Checkout & Auth Flow`, `Catalog Browsing UI`, `Product & Variant Editing`, `Admin Sidebar & Supabase Clients`, `Admin Dashboard & Orders List`, `Product Actions (SKU/Slug)`, `TypeScript Compiler Options`, `tsconfig Duplicate`, `Manual Order Creation`, `Graphify Meta Docs`, `DB Image URL Fix Script`, `Keshali Brand Identity (Logo/Hero)`?**
  _High betweenness centrality (0.278) - this node is a cross-community bridge._
- **Why does `createAdminClient()` connect `Category Admin Actions` to `Public Layout & Catalog Metadata`, `DB Image URL Fix Script`, `Product & Variant Editing`, `tsconfig Duplicate`?**
  _High betweenness centrality (0.091) - this node is a cross-community bridge._
- **Why does `createAdminClient()` connect `Order Status API` to `Public Layout & Catalog Metadata`, `Checkout & Auth Flow`, `Product Actions (SKU/Slug)`, `TypeScript Compiler Options`, `Manual Order Creation`, `S3 Image Migration Script`, `Graphify Meta Docs`, `Keshali Brand Identity (Logo/Hero)`, `Proxy Config (dup B)`?**
  _High betweenness centrality (0.081) - this node is a cross-community bridge._
- **What connects `nextConfig`, `name`, `version` to the rest of the system?**
  _234 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `Category Admin Actions` be split into smaller, more focused modules?**
  _Cohesion score 0.05185779203421545 - nodes in this community are weakly interconnected._
- **Should `Admin Panel Core (Inventory/Sizes)` be split into smaller, more focused modules?**
  _Cohesion score 0.07764705882352942 - nodes in this community are weakly interconnected._
- **Should `Public Layout & Catalog Metadata` be split into smaller, more focused modules?**
  _Cohesion score 0.10465116279069768 - nodes in this community are weakly interconnected._