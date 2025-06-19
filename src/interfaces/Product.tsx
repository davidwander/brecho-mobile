export interface Product {
  id: string;
  name: string;
  type: string; 
  description: string;
  costPrice: number;
  profitMargin: number;
  salePrice: number;
  sold?: boolean;
  createdAt?: Date;
}