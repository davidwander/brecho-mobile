export interface Product {
  id: string;
  name: string;
  type: string; 
  description: string;
  costPrice: number;
  profitMargin: number;
  salePrice: number;
  quantity: number;
  reserved?: boolean;
  sold?: boolean;
  createdAt?: string;
  updatedAt?: string;
  code: string;
}