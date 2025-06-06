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
  reserveProduct: (id: string, qty?: number) => void;
  releaseProduct: (id: string, qty?: number) => void;
};

const ProductContext = createContext<ProductContextType | undefined>(undefined);

type Props = {
  children: ReactNode;
};

export const ProductProvider = ({ children }: Props) => {
  const [products, setProducts] = useState<Product[]>([]);

  const addProduct = (product: Product) => {
    console.log('Adicionando produto:', product.id, 'Estado do estoque antes:', products);
    setProducts(prev => [...prev, { ...product, reserved: false }]);
    console.log('Estado do estoque depois:', products);
  };

  const removeProduct = (id: string) => {
    console.log('Removendo produto:', id, 'Estado do estoque antes:', products);
    setProducts(prev => prev.filter(product => product.id !== id));
    console.log('Estado do estoque depois:', products);
  };

  const reserveProduct = (id: string, qty: number = 1) => {
    console.log('Reservando produto:', id, 'Quantidade:', qty, 'Estado do estoque antes:', products);
    setProducts(prev =>
      prev.map(product => {
        if (product.id === id && product.quantity >= qty) {
          console.log(`Reservando ${id}: quantidade=${product.quantity - qty}, reserved=true`);
          return { ...product, quantity: product.quantity - qty, reserved: true };
        }
        return product;
      })
    );
    console.log('Estado do estoque depois:', products);
  };

  const releaseProduct = (id: string, qty: number = 1) => {
    console.log('Liberando produto:', id, 'Quantidade:', qty, 'Estado do estoque antes:', products);
    setProducts(prev =>
      prev.map(product => {
        if (product.id === id && product.reserved) {
          console.log(`Liberando ${id}: quantidade=${product.quantity + qty}, reserved=${product.quantity + qty > 0}`);
          return { 
            ...product, 
            quantity: product.quantity + qty, 
            reserved: product.quantity + qty > 0 
          };
        }
        return product;
      })
    );
    console.log('Estado do estoque depois:', products);
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