export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export type Database = {
  public: {
    Tables: {
      categories: {
        Row: {
          id: string;
          name: string;
          slug: string;
          active: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          slug: string;
          active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          slug?: string;
          active?: boolean;
          updated_at?: string;
        };
      };
      size_types: {
        Row: {
          id: string;
          name: string;
          unit_label: string;
          active: boolean;
          created_at: string;
        };
        Insert: { id?: string; name: string; unit_label: string; active?: boolean; created_at?: string };
        Update: { id?: string; name?: string; unit_label?: string; active?: boolean };
      };
      sizes: {
        Row: {
          id: string;
          size_type_id: string;
          label: string;
          alt_value: string | null;
          alt_label: string | null;
          sort_order: number;
          active: boolean;
          created_at: string;
        };
        Insert: {
          id?: string;
          size_type_id: string;
          label: string;
          alt_value?: string | null;
          alt_label?: string | null;
          sort_order?: number;
          active?: boolean;
          created_at?: string;
        };
        Update: {
          id?: string;
          size_type_id?: string;
          label?: string;
          alt_value?: string | null;
          alt_label?: string | null;
          sort_order?: number;
          active?: boolean;
        };
      };
      colors: {
        Row: {
          id: string;
          color_code: string;
          name: string;
          hex_code: string;
          active: boolean;
          created_at: string;
        };
        Insert: {
          id?: string;
          color_code: string;
          name: string;
          hex_code: string;
          active?: boolean;
          created_at?: string;
        };
        Update: {
          id?: string;
          color_code?: string;
          name?: string;
          hex_code?: string;
          active?: boolean;
        };
      };
      products: {
        Row: {
          id: string;
          name: string;
          description: string | null;
          category_id: string;
          price_varies_by_color: boolean;
          active: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          description?: string | null;
          category_id: string;
          price_varies_by_color?: boolean;
          active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          description?: string | null;
          category_id?: string;
          price_varies_by_color?: boolean;
          active?: boolean;
          updated_at?: string;
        };
      };
      product_variants: {
        Row: {
          id: string;
          sku: string;
          product_id: string;
          color_id: string;
          size_id: string;
          price_override: number | null;
          active: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          sku: string;
          product_id: string;
          color_id: string;
          size_id: string;
          price_override?: number | null;
          active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          sku?: string;
          product_id?: string;
          color_id?: string;
          size_id?: string;
          price_override?: number | null;
          active?: boolean;
          updated_at?: string;
        };
      };
      inventory: {
        Row: {
          id: string;
          category_id: string;
          size_id: string;
          color_id: string;
          stock: number;
          updated_at: string;
        };
        Insert: {
          id?: string;
          category_id: string;
          size_id: string;
          color_id: string;
          stock?: number;
          updated_at?: string;
        };
        Update: {
          id?: string;
          category_id?: string;
          size_id?: string;
          color_id?: string;
          stock?: number;
          updated_at?: string;
        };
      };
      product_images: {
        Row: {
          id: string;
          variant_id: string;
          url: string;
          alt_text: string | null;
          sort_order: number;
          is_primary: boolean;
          created_at: string;
        };
        Insert: {
          id?: string;
          variant_id: string;
          url: string;
          alt_text?: string | null;
          sort_order?: number;
          is_primary?: boolean;
          created_at?: string;
        };
        Update: {
          id?: string;
          variant_id?: string;
          url?: string;
          alt_text?: string | null;
          sort_order?: number;
          is_primary?: boolean;
        };
      };
      orders: {
        Row: {
          id: string;
          order_number: string;
          customer_name: string;
          customer_email: string;
          customer_phone: string | null;
          shipping_address: Json | null;
          subtotal: number;
          shipping_cost: number;
          total: number;
          status: string;
          notes: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          order_number: string;
          customer_name: string;
          customer_email: string;
          customer_phone?: string | null;
          shipping_address?: Json | null;
          subtotal: number;
          shipping_cost?: number;
          total: number;
          status?: string;
          notes?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          order_number?: string;
          customer_name?: string;
          customer_email?: string;
          customer_phone?: string | null;
          shipping_address?: Json | null;
          subtotal?: number;
          shipping_cost?: number;
          total?: number;
          status?: string;
          notes?: string | null;
          updated_at?: string;
        };
      };
      order_items: {
        Row: {
          id: string;
          order_id: string;
          variant_id: string;
          quantity: number;
          unit_price: number;
          total_price: number;
          created_at: string;
        };
        Insert: {
          id?: string;
          order_id: string;
          variant_id: string;
          quantity: number;
          unit_price: number;
          total_price: number;
          created_at?: string;
        };
        Update: {
          id?: string;
          order_id?: string;
          variant_id?: string;
          quantity?: number;
          unit_price?: number;
          total_price?: number;
        };
      };
    };
    Views: {
      catalog_view: {
        Row: {
          variant_id: string | null;
          sku: string | null;
          variant_active: boolean | null;
          price_override: number | null;
          stock: number | null;
          product_id: string | null;
          product_name: string | null;
          description: string | null;
          price_varies_by_color: boolean | null;
          product_active: boolean | null;
          base_price: number | null;
          price: number | null;
          size_id: string | null;
          size_label: string | null;
          alt_value: string | null;
          alt_label: string | null;
          size_sort_order: number | null;
          size_type_name: string | null;
          unit_label: string | null;
          color_id: string | null;
          color_name: string | null;
          hex_code: string | null;
          color_code: string | null;
          category_id: string | null;
          category_name: string | null;
          category_slug: string | null;
          category_active: boolean | null;
          primary_image_url: string | null;
        };
      };
    };
    Functions: Record<string, never>;
    Enums: Record<string, string>;
  };
};

export type Category = Database["public"]["Tables"]["categories"]["Row"];
export type SizeType = Database["public"]["Tables"]["size_types"]["Row"];
export type Size = Database["public"]["Tables"]["sizes"]["Row"];
export type Color = Database["public"]["Tables"]["colors"]["Row"];
export type Product = Database["public"]["Tables"]["products"]["Row"];
export type ProductVariant = Database["public"]["Tables"]["product_variants"]["Row"];
export type Inventory = Database["public"]["Tables"]["inventory"]["Row"];
export type ProductImage = Database["public"]["Tables"]["product_images"]["Row"];
export type Order = Database["public"]["Tables"]["orders"]["Row"];
export type OrderItem = Database["public"]["Tables"]["order_items"]["Row"];
export type CatalogItem = Database["public"]["Views"]["catalog_view"]["Row"];
