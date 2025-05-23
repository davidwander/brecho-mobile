import React, { createContext, useContext, useState, ReactNode } from 'react';
import { useProduct } from '@contexts/ProductContext';
import { ProductItem, ClientData, SaleData, OpenSale } from '../types/SaleTypes';

export type SalesContextType = {
  openSales: OpenSaleItem[];
  addSale: (sale: SaleData) => void;
  finalizeSale: (index: number) => void;
  cancelSale: () => void;
  clientData: ClientData | null;
  setClientData: (client: ClientData) => void;
  selectedProducts: ProductItem[];
  setSelectedProducts: (products: ProductItem[]) => void;
  clearSaleData: () => void;
  addProductsToSale: (saleId: string, newProducts: ProductItem[]) => void;
  addOpenSale: (sale: OpenSale) => void;
  removeProductFromSale: (saleId: string, productId: string) => void;
  deleteSale: (saleId: string) => void;
  confirmPayment: (saleId: string) => void;
  updateFreight: (saleId: string, freightValue: number, isFreightPaid: boolean) => void; // Nova função
};

const SalesContext = createContext<SalesContextType | undefined>(undefined);

type Props = {
  children: ReactNode;
};

export interface OpenSaleItem {
  id: string;
  clientData: ClientData;
  selectedProducts: ProductItem[];
  total: number;
  date: string;
  isPaid: boolean;
  freightValue?: number; // Novo campo para valor do frete
  isFreightPaid?: boolean; // Novo campo para status do pagamento do frete
}

export const SalesProvider = ({ children }: Props) => {
  const [clientData, setClientDataState] = useState<ClientData | null>(null);
  const [selectedProducts, setSelectedProductsState] = useState<ProductItem[]>([]);
  const { removeProduct, addProduct, reserveProduct, releaseProduct } = useProduct();
  const [openSales, setOpenSales] = useState<OpenSaleItem[]>([]);

  const setClientData = (client: ClientData) => {
    setClientDataState(client);
  };

  const setSelectedProducts = (products: ProductItem[]) => {
    setSelectedProductsState(products);
  };

  const addSale = (sale: SaleData) => {
    setOpenSales(prev => [
      ...prev,
      {
        id: sale.id,
        clientData: sale.client,
        selectedProducts: sale.products,
        total: sale.total,
        date: new Date().toISOString(),
        isPaid: false,
        freightValue: 0, // Inicializa com 0
        isFreightPaid: false, // Inicializa como não pago
      },
    ]);
  };

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

  const cancelSale = () => {
    selectedProducts.forEach(p => {
      releaseProduct(p.id);
    });
    setSelectedProductsState([]);
    setClientDataState(null);
  };

  const returnProductsToStock = (products: ProductItem[]) => {
    products.forEach(p => {
      releaseProduct(p.id);
    });
  };

  const clearSaleData = () => {
    if (selectedProducts.length > 0) {
      returnProductsToStock(selectedProducts);
    }
    setClientDataState(null);
    setSelectedProductsState([]);
  };

  function addProductsToSale(saleId: string, newProducts: ProductItem[]) {
    newProducts.forEach(p => reserveProduct(p.id));

    setOpenSales((prevSales) =>
      prevSales.map((sale) => {
        if (sale.id !== saleId) return sale;

        const existingIds = sale.selectedProducts.map(p => p.id);
        const uniqueNewProducts = newProducts.filter(p => !existingIds.includes(p.id));

        return {
          ...sale,
          selectedProducts: [...sale.selectedProducts, ...uniqueNewProducts],
          total: sale.total + uniqueNewProducts.reduce((acc, p) => acc + p.salePrice, 0),
        };
      })
    );
  }

  const addOpenSale = (sale: OpenSale) => {
    setOpenSales((prevSales) => [
      ...prevSales,
      {
        ...sale,
        isPaid: false,
        date: new Date().toISOString(),
        freightValue: 0, // Inicializa com 0
        isFreightPaid: false, // Inicializa como não pago
      }
    ]);
  };

  const removeProductFromSale = (saleId: string, productId: string) => {
    let removedProduct: ProductItem | undefined;

    setOpenSales((prevSales) =>
      prevSales.map((sale) => {
        if (sale.id !== saleId) return sale;

        const updatedProducts = sale.selectedProducts.filter(p => {
          if (p.id === productId) {
            removedProduct = p;
            return false;
          }
          return true;
        });

        const updatedTotal = updatedProducts.reduce((acc, p) => acc + p.salePrice, 0);

        return {
          ...sale,
          selectedProducts: updatedProducts,
          total: updatedTotal,
        };
      })
    );

    if (removedProduct) {
      releaseProduct(removedProduct.id);
    }
  };

  const deleteSale = (saleId: string) => {
    setOpenSales((prevSales) => {
      const saleToDelete = prevSales.find((s) => s.id === saleId);
      if (saleToDelete) {
        returnProductsToStock(saleToDelete.selectedProducts);
      }
      return prevSales.filter((s) => s.id !== saleId);
    });
  };

  const confirmPayment = (saleId: string) => {
    setOpenSales((prevSales) =>
      prevSales.map((sale) =>
        sale.id === saleId ? { ...sale, isPaid: true } : sale
      )
    );
  };

  const updateFreight = (saleId: string, freightValue: number, isFreightPaid: boolean) => {
    setOpenSales((prevSales) =>
      prevSales.map((sale) =>
        sale.id === saleId
          ? { ...sale, freightValue, isFreightPaid }
          : sale
      )
    );
  };

  return (
    <SalesContext.Provider
      value={{
        openSales,
        addSale,
        finalizeSale,
        cancelSale,
        clientData,
        setClientData,
        selectedProducts,
        setSelectedProducts,
        clearSaleData,
        addProductsToSale,
        addOpenSale,
        removeProductFromSale,
        deleteSale,
        confirmPayment,
        updateFreight,
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