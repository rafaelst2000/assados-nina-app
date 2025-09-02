export interface Product {
  id: string;
  name: string;
  price: number;
  stock: number;
}

export interface SaleItem {
  productId: string;
  quantity: number;
  price: number;
}

export interface Sale {
  id: string ;
  customerName?: string;
  items: SaleItem[];
  total: number;
  isReservation: boolean;
  isPaid: boolean;
  isCollected: boolean;
  isPromotion: boolean;
  promotionPrice?: number;
  createdAt: number;
}

export interface StockEntry {
  productId: string;
  quantity: number;
}