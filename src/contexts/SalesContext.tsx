import React, { createContext, useContext, useState, ReactNode } from 'react';
import { useProduct } from '@contexts/ProductContext';

export type ProductItem = {
  id: string;
  costPrice: number;
  salePrice: number;
  quantity: number;
  type?: "entrada" | "saida";
};

export type ClientData = {
  nameClient: string;
  phone: string;
  address: string;
};

export type SaleData = {
  id: string;
  client: ClientData;
  products: ProductItem[];
  total: number;
  date: string;
};

export type SalesContextType = {
  openSales: OpenSaleItem[];
  addSale: (sale: SaleData) => void;
  finalizeSale: (index: number) => void;
  cancelSale: () => void;  // Adicionando função para cancelar a venda
  clientData: ClientData | null;
  setClientData: (client: ClientData) => void;
  selectedProducts: ProductItem[];
  setSelectedProducts: (products: ProductItem[]) => void;
  clearSaleData: () => void;
};

const SalesContext = createContext<SalesContextType | undefined>(undefined);

type Props = {
  children: ReactNode;
};

export const SalesProvider = ({ children }: Props) => {
  const [clientData, setClientDataState] = useState<ClientData | null>(null);
  const [selectedProducts, setSelectedProductsState] = useState<ProductItem[]>([]);
  const { removeProduct, addProduct, reserveProduct, releaseProduct } = useProduct();
  const [openSales, setOpenSales] = useState<OpenSaleItem[]>([]);

  const setClientData = (client: ClientData) => {
    setClientDataState(client);
  };

  // Seleciona produtos e os marca como reservados
  const setSelectedProducts = (products: ProductItem[]) => {
    setSelectedProductsState(products);
    products.forEach(p => {
      reserveProduct(p.id);  // Reserva o produto
      removeProduct(p.id);    // Remove o produto do estoque
    });
  };

  const addSale = (sale: SaleData) => {
    setOpenSales(prev => [
      ...prev,
      {
        clientData: sale.client,
        selectedProducts: sale.products,
      },
    ]);
  };

  // Finaliza a venda e move os produtos para a venda
  const finalizeSale = (index: number) => {
    const sale = openSales[index];
    sale.selectedProducts.forEach(p => {
      addProduct({
        id: p.id,
        name: '',
        costPrice: p.costPrice,
        salePrice: p.salePrice,
        profitMargin: 0,
        quantity: p.quantity,
        description: '',
        createdAt: new Date().toISOString(),
      });
    });
    setOpenSales(prev => prev.filter((_, i) => i !== index));
  };

  // Cancela a venda e devolve os produtos ao estoque
  const cancelSale = () => {
    returnProductsToStock(selectedProducts);
    setSelectedProductsState([]);
    setClientDataState(null);
  };

  // Devolve os produtos ao estoque
  const returnProductsToStock = (products: ProductItem[]) => {
    products.forEach(p => {
      releaseProduct(p.id); // Libera a reserva
      addProduct({
        id: p.id,
        name: '',
        costPrice: p.costPrice,
        salePrice: p.salePrice,
        profitMargin: 0,
        quantity: p.quantity,
        description: '',
        createdAt: new Date().toISOString(),
      });
    });
  };

  // Limpa os dados de venda em andamento
  const clearSaleData = () => {
    if (selectedProducts.length > 0) {
      returnProductsToStock(selectedProducts);
    }
    setClientDataState(null);
    setSelectedProductsState([]);
  };

  return (
    <SalesContext.Provider
      value={{
        openSales,
        addSale,
        finalizeSale,
        cancelSale,  // Expondo a função para cancelar a venda
        clientData,
        setClientData,
        selectedProducts,
        setSelectedProducts,
        clearSaleData
      }}
    >
      {children}
    </SalesContext.Provider>
  );
};

export const useSales = () => {
  const context = useContext(SalesContext);
  if (!context) {
    throw new Error("useSales deve ser usado dentro de um SalesProvider");
  }
  return context;
};

export type OpenSaleItem = {
  clientData: ClientData;
  selectedProducts: ProductItem[];
};
