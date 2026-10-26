export type ItemType = "PRODUCT" | "SERVICE";
export type Availability = "IN_STOCK" | "OUT_OF_STOCK" | "ON_QUOTATION";
export type ActionType = "ADD_TO_CART" | "SELECT_OPTIONS" | "QUOTE_ONLY";
export type BannerPlacement = "HERO" | "CATEGORY_PROMO" | "SIDEBAR";
export type OrderStatus = "PENDING" | "IN_PREPARATION" | "DELIVERED" | "CANCELLED";
export type ClaimType = "RECLAMO" | "QUEJA";
export type ClaimStatus = "PENDIENTE" | "EN_PROCESO" | "RESUELTO";
export type UserRole = "SUPERADMIN" | "ADMIN";

export type ProductBadge = "Best Seller" | "Nuevo" | "Popular" | "Pocas Unidades" | "Oferta";

export interface User {
  id: number;
  name: string;
  username: string;
  email?: string;
  password?: string;
  role: UserRole;
  isActive: boolean;
  createdAt?: string | Date;
  updatedAt?: string | Date;
}

export interface SiteConfig {
  id: number;
  companyName: string;
  subtitle?: string;
  domain: string;
  logoUrl: string | null;
  heroBannerUrl?: string | null;
  primaryColor: string;
  secondaryColor: string;
  accentColor?: string;
  currency: string;
  whatsappNumber: string;
  topBarText: string;
  contactEmail: string;
  termsPolicy: string | null;
  privacyPolicy: string | null;
  shippingPolicy: string | null;
  returnsPolicy: string | null;
  themePreset?: string;
  cardStyle?: 'with_button' | 'catalog_only';
  desktopColumns?: number;
  showTopBar?: boolean;
  updatedAt?: string | Date;
  createdAt?: string | Date;
}

export interface Category {
  id: number;
  name: string;
  slug: string;
  imageUrl?: string | null;
  image_url?: string | null;
  description?: string | null;
  isActive: boolean;
  order: number;
  parentId?: number | null;
  itemCount?: number;
}

export interface Occasion {
  id: number;
  name: string;
  slug: string;
  iconName?: string | null;
  isActive: boolean;
  itemCount?: number;
}

export interface Policy {
  id: number;
  slug: 'envios' | 'devoluciones' | 'garantias' | 'privacidad' | string;
  title: string;
  content: string;
  updatedAt?: string | Date;
  updated_at?: string | Date;
}

export interface Product {
  id: number;
  sku: string;
  name: string;
  title: string;
  slug: string;
  category_id: number;
  categoryId: number;
  category?: Category;
  categorySlug?: string;
  occasionSlugs?: string[];
  scale: string; // ej. '1:10', '1:32', '1:48', 'RC Estándar', 'Micro'
  material: string; // 'Fibra de Carbono', 'Aluminio CNC', 'Espuma EPO', 'Balsa', 'Compuesto', 'Nylon'
  specs_line: string; // ej. '2200KV | XT60 | 45g'
  compatible_models: string; // ej. 'Aviones RC Glow/Gasolina, Drones, Planeadores'
  price: number; // en Bs.
  old_price?: number | null; // en Bs.
  compareAtPrice?: number | null;
  discountPercent?: number | null;
  stock: number;
  stockQuantity: number;
  badge?: ProductBadge | null;
  image_url: string;
  imageUrl?: string;
  images: string[];
  is_active: boolean;
  isActive: boolean;
  brand?: string | null;
  description?: string;
  specifications?: Record<string, any>;
  variants?: Array<{ name: string; options: string[] }>;
  flowerTypes?: string[];
  created_at?: string | Date;
  updated_at?: string | Date;
  createdAt?: string | Date;
  updatedAt?: string | Date;
  itemType?: ItemType;
  actionType?: ActionType;
  availability?: Availability;
}

// Alias for compatibility
export type CatalogItem = Product;

export interface Banner {
  id: number;
  title: string;
  subtitle?: string | null;
  imageUrl: string;
  buttonText?: string | null;
  buttonUrl?: string | null;
  placement: BannerPlacement;
  isActive: boolean;
}

export interface CartItem {
  item: Product;
  quantity: number;
  selectedOptions?: Record<string, string>;
}

export interface QuoteOrder {
  id?: number;
  orderCode: string;
  customerName: string;
  customerPhone: string;
  recipientName?: string;
  deliveryCity?: string;
  deliveryAddress?: string;
  deliveryDate?: string;
  deliveryTimeSlot?: string;
  cardMessage?: string | null;
  customerNotes?: string | null;
  items: CartItem[];
  total: number;
  status: OrderStatus;
  order?: any;
  whatsappUrl?: string;
  createdAt?: string | Date;
  updatedAt?: string | Date;
}

export interface ClaimRecord {
  id?: number;
  trackingCode: string;
  fullName: string;
  documentId: string;
  phone: string;
  email: string;
  contractedItem: string;
  orderCode?: string | null;
  amount?: number | null;
  type: ClaimType;
  detail: string;
  customerRequest: string;
  status: ClaimStatus;
  adminNotes?: string | null;
  createdAt?: string | Date;
  updatedAt?: string | Date;
}
