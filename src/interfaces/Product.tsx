export interface Product {
  id: string;
  name: string;
  type: string; // tipo da peça (ex: Blusa, Calça, etc.)
  description: string;
  costPrice: number;
  profitMargin: number;
  salePrice: number;
  sold?: boolean; // para marcar se o produto já foi vendido
  createdAt?: Date; // opcional: para exibir data de cadastro no estoque
}