export interface ClientData {
  nameClient: string;
  phone: string;
  cpf: string;
  address: string;
}

export interface Product {
  id: string;
  name: string;
  price: number;
  quantity: number;
}

export interface ProductItem {
  id: string;
  costPrice: number;
  salePrice: number;
  quantity: number;
  type?: "entrada" | "saida";
}

export interface OpenSale {
  id: string;
  clientData: ClientData;
  selectedProducts: ProductItem[];
}

export interface SaleData {
  id: string;
  client: ClientData;
  products: ProductItem[];
  total: number;
  date: string;
}
