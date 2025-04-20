import { createContext, useContext, useState, ReactNode } from 'react';

type Product = {
  id: string;
  name: string;
  type: string;
  description: string;
  costPrice: number;
  profitMargin: number;
  salePrice: number;
};

type ProductContextType = {
  products: Product[];
  addProduct: (product: Product) => void;
};

const ProductContext = createContext<ProductContextType>({} as ProductContextType);

export const ProductProvider = ({ children }: { children: ReactNode }) => {
  const [products, setProducts] = useState<Product[]>([
    {
      id: '1',
      name: 'Vestido Longo',
      type: 'Vestido',
      description: 'Vestido longo estampado, tamanho M',
      costPrice: 40.00,
      profitMargin: 100,
      salePrice: 80.00,
    },
    {
      id: '2',
      name: 'Camisa Social',
      type: 'Camisa',
      description: 'Camisa social branca, tamanho G',
      costPrice: 25.00,
      profitMargin: 100,
      salePrice: 50.00,
    },
    {
      id: '3',
      name: 'Calça Jeans Skinny',
      type: 'Calça Jeans',
      description: 'Calça jeans azul, tamanho 38',
      costPrice: 35.00,
      profitMargin: 100,
      salePrice: 70.00,
    },
  ]);

  const addProduct = (product: Product) => {
    setProducts(prev => [...prev, product]);
  };

  return (
    <ProductContext.Provider value={{ products, addProduct }}>
      {children}
    </ProductContext.Provider>
  );
};

export const useProduct = () => useContext(ProductContext);
