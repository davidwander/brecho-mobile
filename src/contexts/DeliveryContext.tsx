import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useSales, OpenSaleItem } from './SalesContext';
import { useProduct } from './ProductContext';

export interface DeliveryItem extends OpenSaleItem {
  deliveryStatus: 'pending' | 'scheduled' | 'shipped' | 'delivered';
  shippedDate?: string;
  deliveredDate?: string;
}

interface DeliveryContextType {
  pendingDeliveries: DeliveryItem[];
  shippedDeliveries: DeliveryItem[];
  deliveredItems: DeliveryItem[];
  updateDeliveryDate: (saleId: string, deliveryDate: string) => void;
  confirmShipment: (saleId: string) => void;
  confirmDelivery: (saleId: string) => void;
  cancelDelivery: (saleId: string) => void;
  getDeliveryById: (saleId: string) => DeliveryItem | undefined;
  getDeliveriesByStatus: (status: DeliveryItem['deliveryStatus']) => DeliveryItem[];
}

const DeliveryContext = createContext<DeliveryContextType | undefined>(undefined);

interface DeliveryProviderProps {
  children: ReactNode;
}

export function DeliveryProvider({ children }: DeliveryProviderProps) {
  const { shipments, updateDeliveryDate: updateSaleDeliveryDate } = useSales();
  const { removeProduct, releaseProduct } = useProduct();
  const [deliveryItems, setDeliveryItems] = useState<DeliveryItem[]>([]);

  useEffect(() => {
    const updatedDeliveries: DeliveryItem[] = shipments.map(sale => {
      const existingDelivery = deliveryItems.find(item => item.id === sale.id);
      return {
        ...sale,
        deliveryStatus: existingDelivery?.deliveryStatus || 
          (sale.deliveryDate ? 'scheduled' : 'pending'),
        shippedDate: existingDelivery?.shippedDate,
        deliveredDate: existingDelivery?.deliveredDate,
      } as DeliveryItem;
    });
    setDeliveryItems(updatedDeliveries);
  }, [shipments]);

  const pendingDeliveries = deliveryItems.filter(
    item => item.deliveryStatus === 'pending' || item.deliveryStatus === 'scheduled'
  );
  
  const shippedDeliveries = deliveryItems.filter(
    item => item.deliveryStatus === 'shipped'
  );
  
  const deliveredItems = deliveryItems.filter(
    item => item.deliveryStatus === 'delivered'
  );

  const updateDeliveryDate = (saleId: string, deliveryDate: string) => {
    try {
      console.log('Atualizando data de entrega:', { saleId, deliveryDate });
      updateSaleDeliveryDate(saleId, deliveryDate);
      setDeliveryItems(prev => prev.map(item => 
        item.id === saleId 
          ? { ...item, deliveryDate, deliveryStatus: 'scheduled' as const }
          : item
      ));
    } catch (error) {
      console.error('Erro ao atualizar data de entrega:', error);
      throw error;
    }
  };

  const confirmShipment = (saleId: string) => {
    try {
      console.log('Confirmando envio:', saleId);
      const currentDate = new Date().toISOString().split('T')[0];
      setDeliveryItems(prev => prev.map(item => 
        item.id === saleId 
          ? { 
              ...item, 
              deliveryStatus: 'shipped' as const,
              shippedDate: currentDate
            }
          : item
      ));
    } catch (error) {
      console.error('Erro ao confirmar envio:', error);
      throw error;
    }
  };

  const confirmDelivery = (saleId: string) => {
    try {
      console.log('Confirmando entrega:', saleId);
      const currentDate = new Date().toISOString().split('T')[0];
      const sale = deliveryItems.find(item => item.id === saleId);
      
      if (sale) {
        sale.selectedProducts.forEach(p => {
          console.log(`Removendo produto ${p.id} do estoque`);
          removeProduct(p.id);
        });
        
        setDeliveryItems(prev => prev.map(item => 
          item.id === saleId 
            ? { 
                ...item, 
                deliveryStatus: 'delivered' as const,
                deliveredDate: currentDate
              }
            : item
        ));
      }
    } catch (error) {
      console.error('Erro ao confirmar entrega:', error);
      throw error;
    }
  };

  const cancelDelivery = (saleId: string) => {
    try {
      console.log('Cancelando entrega:', saleId);
      const sale = deliveryItems.find(item => item.id === saleId);
      
      if (sale) {
        sale.selectedProducts.forEach(p => {
          console.log(`Liberando produto ${p.id} com quantidade ${p.quantity || 1}`);
          releaseProduct(p.id, p.quantity || 1);
        });
        
        setDeliveryItems(prev => prev.map(item => 
          item.id === saleId 
            ? { 
                ...item, 
                deliveryStatus: 'pending' as const,
                deliveryDate: undefined,
                shippedDate: undefined,
                deliveredDate: undefined
              }
            : item
        ));
        
        updateSaleDeliveryDate(saleId, '');
      }
    } catch (error) {
      console.error('Erro ao cancelar entrega:', error);
      throw error;
    }
  };

  const getDeliveryById = (saleId: string): DeliveryItem | undefined => {
    return deliveryItems.find(item => item.id === saleId);
  };

  const getDeliveriesByStatus = (status: DeliveryItem['deliveryStatus']): DeliveryItem[] => {
    return deliveryItems.filter(item => item.deliveryStatus === status);
  };

  const contextValue: DeliveryContextType = {
    pendingDeliveries,
    shippedDeliveries,
    deliveredItems,
    updateDeliveryDate,
    confirmShipment,
    confirmDelivery,
    cancelDelivery,
    getDeliveryById,
    getDeliveriesByStatus,
  };

  return (
    <DeliveryContext.Provider value={contextValue}>
      {children}
    </DeliveryContext.Provider>
  );
}

export function useDelivery(): DeliveryContextType {
  const context = useContext(DeliveryContext);
  if (!context) {
    throw new Error('useDelivery deve ser usado dentro de um DeliveryProvider');
  }
  return context;
}