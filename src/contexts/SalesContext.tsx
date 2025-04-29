import React, { createContext, useContext, useState, ReactNode } from 'react';

// Definindo os tipos
export type ClientData = {
  nameClient: string;
  cpf: string;
  address: string;
};

export type ProductItem = {
  id: string;
  type: string;
  costPrice: number;
  salePrice: number;
  // Outros campos que possam existir no produto
};

export type OpenSaleItem = {
  clientData: ClientData;
  selectedProducts: ProductItem[];
};

type SalesContextData = {
  clientData: ClientData | null;
  selectedProducts: ProductItem[];
  setClientData: (data: ClientData) => void;
  setSelectedProducts: (products: ProductItem[]) => void;
  clearSaleData: () => void;
  openSales: OpenSaleItem[];
  addSale: (newSale: OpenSaleItem) => void; 
  removeSale: (index: number) => void; // Adicionando a função de remover venda
};

const SalesContext = createContext<SalesContextData>({} as SalesContextData);

export function SalesProvider({ children }: { children: ReactNode }) {
  const [clientData, setClientData] = useState<ClientData | null>(null);
  const [selectedProducts, setSelectedProducts] = useState<ProductItem[]>([]);
  const [openSales, setOpenSales] = useState<OpenSaleItem[]>([]); 

  const addSale = (newSale: OpenSaleItem) => {
    setOpenSales((prevSales) => [...prevSales, newSale]);
  };

  const removeSale = (index: number) => {
    setOpenSales((prevSales) => prevSales.filter((_, i) => i !== index));
  };

  const clearSaleData = () => {
    setClientData(null);
    setSelectedProducts([]);
  };

  return (
    <SalesContext.Provider
      value={{
        clientData,
        selectedProducts,
        setClientData,
        setSelectedProducts,
        clearSaleData,
        openSales,
        addSale,
        removeSale, // Passando a função de remover venda
      }}
    >
      {children}
    </SalesContext.Provider>
  );
}

// Hook personalizado para usar o contexto
export function useSales() {
  const context = useContext(SalesContext);

  if (!context) {
    throw new Error('useSales deve ser usado dentro de um SalesProvider');
  }

  return context;
}
