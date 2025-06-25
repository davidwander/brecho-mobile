export interface Product {
  id: string;
  name: string;
  type: string;
  code?: string;
  description?: string;
  costPrice: number;
  profitMargin: number;
  salePrice: number;
  quantity: number;
  status: string;
  reserved: boolean;
  sold: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface Client {
  id: string;
  name: string;
  phone?: string;
  email?: string;
  address?: string;
  createdAt: Date;
  updatedAt: Date;
  sales: Sale[];
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
  client: Client;
  products: SaleProduct[];
  delivery?: Delivery;
}

export interface SaleProduct {
  id: string;
  saleId: string;
  productId: string;
  quantity: number;
  price: number;
  product: Product;
}

export interface Delivery {
  id: string;
  saleId: string;
  date: Date;
  address: string;
  status: string;
  createdAt: Date;
  updatedAt: Date;
  sale: Sale;
}

export interface User {
  id: string;
  name: string;
  email: string;
  createdAt: Date;
  updatedAt: Date;
} 