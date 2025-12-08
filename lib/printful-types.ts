// lib/printful-types.ts

export interface Paging {
  total?: number;
  limit?: number;
  offset?: number;
}

export interface CatalogCategory {
  id: number;
  parent_id?: number | null;
  image_url?: string;
  title: string;
  // there may be extra _links etc. that you can ignore or type as unknown
}

export interface CatalogProduct {
  id: number;
  type: string;                // e.g. "T-SHIRT"
  main_category_id: number;
  name: string;
  brand: string | null;
  model: string | null;
  image: string;               // URL to product image
  variant_count: number;
  is_discontinued: boolean;
  description?: string;
  sizes: string[];
  colors: PrintfulColor[];
  techniques: PrintfulTechnique[];
  placements: PrintfulPlacement[];
  product_options?: PrintfulProductOption[];
  _links?: { [key: string]: { href: string } };
}

export interface PrintfulTechnique {
  key: string;
  display_name: string;
  is_default: boolean;
}

export interface PrintfulProductOption {
  name: string;
  techniques: string[];
  type: string;            // maybe "bool" or "string", depending on the option
  values: (string | boolean)[];
}

export interface PrintfulLayerOptionValues {
  [colorHex: string]: string;  // e.g. "#FFFFFF": "1801 White"
}

export interface PrintfulLayerOption {
  name: string;
  techniques: string[];
  type: string;    // likely "array"
  values: PrintfulLayerOptionValues;
}

export interface PrintfulLayer {
  type: string;            // e.g. "file"
  layer_options: PrintfulLayerOption[];
}

export interface PrintfulPlacement {
  placement: string;          // e.g. "front", "embroidery_chest_left"
  technique: string;          // e.g. "dtg", "embroidery"
  layers: PrintfulLayer[];
  placement_options: unknown[];       // if unknown — or define more precisely if you know the shape
  conflicting_placements: string[];
}

export interface PrintfulColor {
  name: string;
  value: string;         // hex color code (e.g. "#ffffff")
}

export interface CatalogVariant {
  id: number;                 // This is variant_id — size/color specific ID. :contentReference[oaicite:8]{index=8}
  catalog_product_id: number;
  name: string;              // e.g. "Gildan ... T‑Shirt (Black / 2XL)" :contentReference[oaicite:9]{index=9}
  size?: string;
  color?: string;
  // there might be other optional fields depending on product type
}

export interface CatalogResponse<T> {
  data: T[];
  paging?: Paging;
  _links?: unknown;
}
