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
      products: {
        Row: {
          id: string;
          model_code: string;
          name: string;
          capacity: string | null;
          material: string | null;
          base_cost: number;
          sale_price: number;
          stock: number;
          active: boolean;
          category_id: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          model_code: string;
          name: string;
          capacity?: string | null;
          material?: string | null;
          base_cost: number;
          sale_price: number;
          stock?: number;
          active?: boolean;
          category_id: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          model_code?: string;
          name?: string;
          capacity?: string | null;
          material?: string | null;
          base_cost?: number;
          sale_price?: number;
          stock?: number;
          active?: boolean;
          category_id?: string;
          updated_at?: string;
        };
      };
      product_variants: {
        Row: {
          id: string;
          sku: string;
          product_id: string;
          design_id: string | null;
          color_id: string | null;
          size_id: string | null;
          title: string;
          price: number;
          stock: number;
          active: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          sku: string;
          product_id: string;
          design_id?: string | null;
          color_id?: string | null;
          size_id?: string | null;
          title: string;
          price: number;
          stock?: number;
          active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          sku?: string;
          product_id?: string;
          design_id?: string | null;
          color_id?: string | null;
          size_id?: string | null;
          title?: string;
          price?: number;
          stock?: number;
          active?: boolean;
          updated_at?: string;
        };
      };
      designs: {
        Row: {
          id: string;
          design_ref: string;
          name: string;
          category: string | null;
          description: string | null;
          tags: string[] | null;
          file_name: string | null;
          image_url: string | null;
          active: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          design_ref: string;
          name: string;
          category?: string | null;
          description?: string | null;
          tags?: string[] | null;
          file_name?: string | null;
          image_url?: string | null;
          active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          design_ref?: string;
          name?: string;
          category?: string | null;
          description?: string | null;
          tags?: string[] | null;
          file_name?: string | null;
          image_url?: string | null;
          active?: boolean;
          updated_at?: string;
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
      sizes: {
        Row: {
          id: string;
          name: string;
          abbreviation: string;
          description: string | null;
          sort_order: number;
          active: boolean;
          created_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          abbreviation: string;
          description?: string | null;
          sort_order?: number;
          active?: boolean;
          created_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          abbreviation?: string;
          description?: string | null;
          sort_order?: number;
          active?: boolean;
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
          title: string | null;
          price: number | null;
          stock: number | null;
          model_code: string | null;
          product_name: string | null;
          material: string | null;
          capacity: string | null;
          category_name: string | null;
          category_slug: string | null;
          design_ref: string | null;
          design_name: string | null;
          design_image: string | null;
          design_tags: string[] | null;
          color_name: string | null;
          color_hex: string | null;
          size_abbr: string | null;
          size_name: string | null;
        };
      };
    };
    Functions: Record<string, never>;
    Enums: Record<string, string>;
  };
};

export type CatalogItem = Database["public"]["Views"]["catalog_view"]["Row"];
export type Category = Database["public"]["Tables"]["categories"]["Row"];
export type Product = Database["public"]["Tables"]["products"]["Row"];
export type ProductVariant = Database["public"]["Tables"]["product_variants"]["Row"];
export type Design = Database["public"]["Tables"]["designs"]["Row"];
export type Color = Database["public"]["Tables"]["colors"]["Row"];
export type Size = Database["public"]["Tables"]["sizes"]["Row"];
export type Order = Database["public"]["Tables"]["orders"]["Row"];
export type OrderItem = Database["public"]["Tables"]["order_items"]["Row"];
export type ProductImage = Database["public"]["Tables"]["product_images"]["Row"];
