# Graph Report - keshali-design  (2026-05-25)

## Corpus Check
- 71 files · ~206,090 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 315 nodes · 559 edges · 20 communities (14 shown, 6 thin omitted)
- Extraction: 100% EXTRACTED · 0% INFERRED · 0% AMBIGUOUS
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `4f44fa66`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)
- [[_COMMUNITY_Community 0|Community 0]]
- [[_COMMUNITY_Community 1|Community 1]]
- [[_COMMUNITY_Community 2|Community 2]]
- [[_COMMUNITY_Community 3|Community 3]]
- [[_COMMUNITY_Community 4|Community 4]]
- [[_COMMUNITY_Community 5|Community 5]]
- [[_COMMUNITY_Community 6|Community 6]]
- [[_COMMUNITY_Community 7|Community 7]]
- [[_COMMUNITY_Community 8|Community 8]]
- [[_COMMUNITY_Community 9|Community 9]]
- [[_COMMUNITY_Community 10|Community 10]]
- [[_COMMUNITY_Community 11|Community 11]]
- [[_COMMUNITY_Community 12|Community 12]]
- [[_COMMUNITY_Community 15|Community 15]]
- [[_COMMUNITY_Community 17|Community 17]]
- [[_COMMUNITY_Community 18|Community 18]]
- [[_COMMUNITY_Community 19|Community 19]]

## God Nodes (most connected - your core abstractions)
1. `createAdminClient()` - 55 edges
2. `formatCOP()` - 26 edges
3. `compilerOptions` - 16 edges
4. `useCart` - 11 edges
5. `sendNewOrderNotification()` - 6 edges
6. `scripts` - 5 edges
7. `updateOrderStatus()` - 5 edges
8. `updateVariantFull()` - 5 edges
9. `deleteVariantImage()` - 5 edges
10. `addVariantImages()` - 5 edges

## Surprising Connections (you probably didn't know these)
- `AdminPedidosPage()` --calls--> `createAdminClient()`  [EXTRACTED]
  app/admin/pedidos/page.tsx → lib/supabase/admin.ts
- `AdminProductosPage()` --calls--> `createAdminClient()`  [EXTRACTED]
  app/admin/productos/page.tsx → lib/supabase/admin.ts
- `NuevoProductoPage()` --calls--> `createAdminClient()`  [EXTRACTED]
  app/admin/productos/nuevo/page.tsx → lib/supabase/admin.ts
- `EditProductPage()` --calls--> `createAdminClient()`  [EXTRACTED]
  app/admin/productos/[id]/page.tsx → lib/supabase/admin.ts
- `StockPage()` --calls--> `createAdminClient()`  [EXTRACTED]
  app/admin/stock/page.tsx → lib/supabase/admin.ts

## Communities (20 total, 6 thin omitted)

### Community 0 - "Community 0"
Cohesion: 0.08
Nodes (38): CategoriasManager(), Props, AdminDashboardPage(), TamanosManager(), createCategory(), createSubcategory(), setCategoryColors(), setCategorySizes() (+30 more)

### Community 1 - "Community 1"
Cohesion: 0.10
Nodes (28): HomePage(), CatalogoPage(), metadata, Props, SubcategorySelect(), getStockLabel(), generateMetadata(), ProductPage() (+20 more)

### Community 2 - "Community 2"
Cohesion: 0.06
Nodes (31): dependencies, clsx, lucide-react, next, react, react-dom, resend, sharp (+23 more)

### Community 3 - "Community 3"
Cohesion: 0.09
Nodes (19): metadata, CheckoutInput, CheckoutItem, createOrder(), CheckoutPage(), Footer(), Header(), NAV_LINKS (+11 more)

### Community 4 - "Community 4"
Cohesion: 0.08
Nodes (22): AdminSidebar(), NAV, metadata, cn(), createClient(), createClient(), CatalogItem, Category (+14 more)

### Community 5 - "Community 5"
Cohesion: 0.14
Nodes (15): getVariantPrice(), ItemRow, NuevoPedidoForm(), STATUSES, getVariantLabel(), getVariantPrice(), VariantCombobox(), metadata (+7 more)

### Community 6 - "Community 6"
Cohesion: 0.13
Nodes (18): DeleteProductButton(), NuevoProductoForm(), Step, metadata, CategoryOpt, ColorOpt, NuevoProductoPage(), SizeOpt (+10 more)

### Community 7 - "Community 7"
Cohesion: 0.10
Nodes (19): compilerOptions, allowJs, esModuleInterop, incremental, isolatedModules, jsx, lib, module (+11 more)

### Community 8 - "Community 8"
Cohesion: 0.20
Nodes (13): EditProductForm(), ProductHeader(), VariantCard(), EditVariantFullForm(), Image, addVariantImages(), deleteVariantImage(), updateVariantFull() (+5 more)

### Community 9 - "Community 9"
Cohesion: 0.26
Nodes (12): OrderStatusSelect(), STATUSES, getResend(), OrderEmailData, orderEmailHtml(), sendNewOrderNotification(), sendOrderConfirmationToCustomer(), sendOrderDeliveredEmail() (+4 more)

### Community 10 - "Community 10"
Cohesion: 0.25
Nodes (9): InventoryEntry, Slot, StockManager(), CategoryOpt, ColorOpt, InventoryRow, metadata, SizeOpt (+1 more)

## Knowledge Gaps
- **110 isolated node(s):** `nextConfig`, `name`, `version`, `private`, `dev` (+105 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **6 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `createAdminClient()` connect `Community 0` to `Community 3`, `Community 5`, `Community 6`, `Community 8`, `Community 9`, `Community 10`?**
  _High betweenness centrality (0.185) - this node is a cross-community bridge._
- **Why does `formatCOP()` connect `Community 5` to `Community 1`, `Community 3`, `Community 6`, `Community 8`, `Community 9`, `Community 10`?**
  _High betweenness centrality (0.131) - this node is a cross-community bridge._
- **Why does `ProductCard()` connect `Community 1` to `Community 5`?**
  _High betweenness centrality (0.018) - this node is a cross-community bridge._
- **What connects `nextConfig`, `name`, `version` to the rest of the system?**
  _110 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `Community 0` be split into smaller, more focused modules?**
  _Cohesion score 0.0815686274509804 - nodes in this community are weakly interconnected._
- **Should `Community 1` be split into smaller, more focused modules?**
  _Cohesion score 0.09672830725462304 - nodes in this community are weakly interconnected._
- **Should `Community 2` be split into smaller, more focused modules?**
  _Cohesion score 0.0625 - nodes in this community are weakly interconnected._