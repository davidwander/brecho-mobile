export interface Product {
  id: string;
  name: string;
  description?: string;
  costPrice: number;
  profitMargin: number;
  salePrice: number;
  quantity: number;
  category?: string;
  status: string;
  reserved: boolean;
  sold: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface Sale {
  id: string;
  clientId: string;
  userId: string;
  total: number;
  status: string;
  paymentType?: string;
  createdAt: Date;
  updatedAt: Date;
  products: SaleProduct[];
  delivery?: Delivery;
}

export interface SaleProduct {
  id: string;
  saleId: string;
  productId: string;
  quantity: number;
  price: number;
}

export interface Delivery {
  id: string;
  saleId: string;
  status: string;
  address: string;
  date?: Date;
  createdAt: Date;
  updatedAt: Date;
} 