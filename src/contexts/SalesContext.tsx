import React, { createContext, useContext, useState, ReactNode } from 'react';
import { useProduct } from '@contexts/ProductContext';
import { ProductItem, ClientData, SaleData, OpenSale } from '../types/SaleTypes';

export type SalesContextType = {
  openSales: OpenSaleItem[];
  shipments: OpenSaleItem[];
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
  updateFreight: (saleId: string, freightValue: number, isFreightPaid: boolean) => void;
  updateDeliveryDate: (saleId: string, deliveryDate: string) => void; 
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
  freightValue?: number;
  isFreightPaid?: boolean;
  deliveryDate?: string; 
}

export const SalesProvider = ({ children }: Props) => {
  const [clientData, setClientDataState] = useState<ClientData | null>(null);
  const [selectedProducts, setSelectedProductsState] = useState<ProductItem[]>([]);
  const { removeProduct, addProduct, reserveProduct, releaseProduct, products } = useProduct();
  const [openSales, setOpenSales] = useState<OpenSaleItem[]>([]);
  const [shipments, setShipments] = useState<OpenSaleItem[]>([]);

  const setClientData = (client: ClientData) => {
    setClientDataState(client);
  };

  const setSelectedProducts = (products: ProductItem[]) => {
    setSelectedProductsState(products);
  };

  const addSale = (sale: SaleData) => {
    console.log('Adicionando venda:', sale.id, 'Produtos:', sale.products);
    sale.products.forEach(p => reserveProduct(p.id, p.quantity || 1));
    setOpenSales(prev => [
      ...prev,
      {
        id: sale.id,
        clientData: sale.client,
        selectedProducts: sale.products,
        total: sale.total,
        date: new Date().toISOString(),
        isPaid: false,
        freightValue: 0,
        isFreightPaid: false,
        deliveryDate: undefined,
      },
    ]);
  };

  const finalizeSale = (index: number) => {
    console.log('Finalizando venda no índice:', index);
    const sale = openSales[index];
    console.log('Produtos mantidos reservados:', sale.selectedProducts);
    setOpenSales(prev => prev.filter((_, i) => i !== index));
  };

  const cancelSale = () => {
    selectedProducts.forEach(p => {
      releaseProduct(p.id, p.quantity || 1);
    });
    setSelectedProductsState([]);
    setClientDataState(null);
  };

  const returnProductsToStock = (products: ProductItem[]) => {
    products.forEach(p => {
      releaseProduct(p.id, p.quantity || 1);
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
    console.log('Adicionando produtos à venda:', saleId, 'Produtos:', newProducts);
    newProducts.forEach(p => reserveProduct(p.id, p.quantity || 1));

    setOpenSales((prevSales) =>
      prevSales.map((sale) => {
        if (sale.id !== saleId) return sale;

        const existingIds = sale.selectedProducts.map(p => p.id);
        const uniqueNewProducts = newProducts.filter(p => !existingIds.includes(p.id));

        return {
          ...sale,
          selectedProducts: [...sale.selectedProducts, ...uniqueNewProducts],
          total: sale.total + uniqueNewProducts.reduce((acc, p) => acc + (p.salePrice * (p.quantity || 1)), 0),
        };
      })
    );
  }

  const addOpenSale = (sale: OpenSale) => {
    console.log('Adicionando venda aberta:', sale.id);
    setOpenSales((prevSales) => [
      ...prevSales,
      {
        ...sale,
        isPaid: false,
        date: new Date().toISOString(),
        freightValue: 0,
        isFreightPaid: false,
        deliveryDate: undefined,
      }
    ]);
  };

  const removeProductFromSale = (saleId: string, productId: string) => {
    console.log('Removendo produto da venda:', saleId, 'Produto:', productId);
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

        const updatedTotal = updatedProducts.reduce((acc, p) => acc + (p.salePrice * (p.quantity || 1)), 0);

        return {
          ...sale,
          selectedProducts: updatedProducts,
          total: updatedTotal,
        };
      })
    );

    if (removedProduct) {
      console.log('Liberando produto:', removedProduct.id);
      releaseProduct(removedProduct.id, removedProduct.quantity || 1);
    }
  };

  const deleteSale = (saleId: string) => {
    console.log('Excluindo venda:', saleId);
    setOpenSales((prevSales) => {
      const saleToDelete = prevSales.find((s) => s.id === saleId);
      if (saleToDelete) {
        returnProductsToStock(saleToDelete.selectedProducts);
      }
      return prevSales.filter((s) => s.id !== saleId);
    });
    setShipments((prevShipments) => {
      const saleToDelete = prevShipments.find((s) => s.id === saleId);
      if (saleToDelete) {
        returnProductsToStock(saleToDelete.selectedProducts);
      }
      return prevShipments.filter((s) => s.id !== saleId);
    });
    console.log('Venda excluída:', saleId);
  };

  const confirmPayment = (saleId: string) => {
    console.log('Confirmando pagamento para venda:', saleId);
    setOpenSales((prevSales) => {
      const sale = prevSales.find((s) => s.id === saleId);
      if (!sale) return prevSales;

      const updatedSale = { ...sale, isPaid: true };

      if (updatedSale.isPaid && updatedSale.isFreightPaid) {
        console.log('Movendo venda para shipments:', saleId);
        setShipments((prev) => [...prev, updatedSale]);
        return prevSales.filter((s) => s.id !== saleId);
      }

      return prevSales.map((s) => (s.id === saleId ? updatedSale : s));
    });
  };

  const updateFreight = (saleId: string, freightValue: number, isFreightPaid: boolean) => {
    console.log('Antes de atualizar frete:', { saleId, stock: products, shipments });
    setOpenSales((prevSales) => {
      const sale = prevSales.find((s) => s.id === saleId);
      if (!sale) {
        console.log('Venda não encontrada:', saleId);
        return prevSales;
      }

      const updatedSale = { ...sale, freightValue, isFreightPaid };
      console.log('Atualizando venda:', { saleId, freightValue, isFreightPaid });

      if (updatedSale.isPaid && updatedSale.isFreightPaid) {
        console.log('Movendo venda para shipments:', saleId);
        setShipments((prev) => {
          const newShipments = [...prev, updatedSale];
          console.log('Novo estado de shipments:', newShipments);
          return newShipments;
        });
        return prevSales.filter((s) => s.id !== saleId);
      }

      return prevSales.map((s) => (s.id === saleId ? updatedSale : s));
    });
    console.log('Depois de atualizar frete:', { saleId, stock: products, shipments });
  };

  const updateDeliveryDate = (saleId: string, deliveryDate: string) => {
    console.log('Atualizando data de entrega para venda:', saleId, deliveryDate);
    setShipments((prevShipments) =>
      prevShipments.map((sale) =>
        sale.id === saleId ? { ...sale, deliveryDate } : sale
      )
    );
  };

  return (
    <SalesContext.Provider
      value={{
        openSales,
        shipments,
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
        updateDeliveryDate,
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