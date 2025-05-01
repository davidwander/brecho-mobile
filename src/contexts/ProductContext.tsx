import React, { createContext, useContext, useState, ReactNode } from 'react';

export type Product = {
  id: string;
  name: string;
  costPrice: number;
  profitMargin: number;
  quantity: number;
  description?: string;
  createdAt: string;
  type?: string;        
  salePrice: number;
  reserved?: boolean;    
};

type ProductContextType = {
  products: Product[];
  addProduct: (product: Product) => void;
  removeProduct: (id: string) => void;
  reserveProduct: (id: string) => void;
  releaseProduct: (id: string) => void;
};

const ProductContext = createContext<ProductContextType | undefined>(undefined);

type Props = {
  children: ReactNode;
};

export const ProductProvider = ({ children }: Props) => {
  const [products, setProducts] = useState<Product[]>([]);

  const addProduct = (product: Product) => {
    setProducts(prev => [...prev, product]);
  };

  const removeProduct = (id: string) => {
    setProducts(prev => prev.filter(product => product.id !== id));
  };

  const reserveProduct = (id: string) => {
    setProducts(prev =>
      prev.map(product =>
        product.id === id ? { ...product, reserved: true } : product
      )
    );
  };

  const releaseProduct = (id: string) => {
    setProducts(prev =>
      prev.map(product =>
        product.id === id ? { ...product, reserved: false } : product
      )
    );
  };

  return (
    <ProductContext.Provider 
      value={{ 
        products, 
        addProduct, 
        removeProduct,
        reserveProduct,
        releaseProduct
      }}
    >
      {children}
    </ProductContext.Provider>
  );
};

export const useProduct = () => {
  const context = useContext(ProductContext);
  if (!context) {
    throw new Error("useProduct deve ser usado dentro de um ProductProvider");
  }
  return context;
};
