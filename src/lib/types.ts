export type ItemType = "PRODUCT" | "SERVICE";
export type Availability = "IN_STOCK" | "OUT_OF_STOCK" | "ON_QUOTATION";
export type ActionType = "ADD_TO_CART" | "SELECT_OPTIONS" | "QUOTE_ONLY";
export type BannerPlacement = "HERO" | "CATEGORY_PROMO" | "SIDEBAR";
export type OrderStatus = "PENDING" | "IN_PREPARATION" | "DELIVERED" | "CANCELLED";
export type ClaimType = "RECLAMO" | "QUEJA";
export type ClaimStatus = "PENDIENTE" | "EN_PROCESO" | "RESUELTO";

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
  parentId?: number | null;
  imageUrl?: string | null;
  description?: string | null;
  isActive: boolean;
  order: number;
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

export interface CatalogItem {
  id: number;
  sku: string;
  title: string;
  slug: string;
  brand?: string | null;
  description: string;
  itemType: ItemType;
  price: number;
  compareAtPrice?: number | null;
  discountPercent?: number | null;
  availability: Availability;
  stockQuantity: number;
  actionType: ActionType;
  flowerTypes?: string[];
  specifications?: Record<string, any>;
  variants?: Array<{ name: string; options: string[] }>;
  images: string[];
  categoryId: number;
  category?: Category;
  occasionSlugs?: string[];
  createdAt?: string | Date;
  updatedAt?: string | Date;
}

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
  item: CatalogItem;
  quantity: number;
  selectedOptions?: Record<string, string>;
}

export interface QuoteOrder {
  id?: number;
  orderCode: string;
  customerName: string;
  customerPhone: string;
  recipientName: string;
  deliveryDate: string;
  deliveryTimeSlot: string;
  deliveryAddress: string;
  cardMessage?: string | null;
  items: CartItem[];
  total: number;
  status: OrderStatus;
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
