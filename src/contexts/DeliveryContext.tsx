import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useSales, OpenSaleItem } from './SalesContext';

export interface DeliveryItem extends OpenSaleItem {
  deliveryStatus: 'pending' | 'scheduled' | 'shipped' | 'delivered';
  shippedDate?: string;
  deliveredDate?: string;
}

interface DeliveryContextType {
  // Estados
  pendingDeliveries: DeliveryItem[];
  shippedDeliveries: DeliveryItem[];
  deliveredItems: DeliveryItem[];
  
  // Ações
  updateDeliveryDate: (saleId: string, deliveryDate: string) => void;
  confirmShipment: (saleId: string) => void;
  confirmDelivery: (saleId: string) => void;
  cancelDelivery: (saleId: string) => void;
  
  // Utilitários
  getDeliveryById: (saleId: string) => DeliveryItem | undefined;
  getDeliveriesByStatus: (status: DeliveryItem['deliveryStatus']) => DeliveryItem[];
}

const DeliveryContext = createContext<DeliveryContextType | undefined>(undefined);

interface DeliveryProviderProps {
  children: ReactNode;
}

export function DeliveryProvider({ children }: DeliveryProviderProps) {
  const { shipments, updateDeliveryDate: updateSaleDeliveryDate } = useSales();
  
  // Estados locais para gerenciar as entregas
  const [deliveryItems, setDeliveryItems] = useState<DeliveryItem[]>([]);

  // Sincronizar com as vendas do SalesContext
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

  // Filtros por status
  const pendingDeliveries = deliveryItems.filter(
    item => item.deliveryStatus === 'pending' || item.deliveryStatus === 'scheduled'
  );
  
  const shippedDeliveries = deliveryItems.filter(
    item => item.deliveryStatus === 'shipped'
  );
  
  const deliveredItems = deliveryItems.filter(
    item => item.deliveryStatus === 'delivered'
  );

  // Atualizar data de entrega
  const updateDeliveryDate = (saleId: string, deliveryDate: string) => {
    try {
      // Atualizar no contexto de vendas
      updateSaleDeliveryDate(saleId, deliveryDate);
      
      // Atualizar no contexto de entregas
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

  // Confirmar que a venda saiu para entrega
  const confirmShipment = (saleId: string) => {
    try {
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

  // Confirmar entrega realizada
  const confirmDelivery = (saleId: string) => {
    try {
      const currentDate = new Date().toISOString().split('T')[0];
      
      setDeliveryItems(prev => prev.map(item => 
        item.id === saleId 
          ? { 
              ...item, 
              deliveryStatus: 'delivered' as const,
              deliveredDate: currentDate
            }
          : item
      ));
    } catch (error) {
      console.error('Erro ao confirmar entrega:', error);
      throw error;
    }
  };

  // Cancelar entrega (voltar para pendente)
  const cancelDelivery = (saleId: string) => {
    try {
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
      
      // Também limpar a data no contexto de vendas
      updateSaleDeliveryDate(saleId, '');
    } catch (error) {
      console.error('Erro ao cancelar entrega:', error);
      throw error;
    }
  };

  // Utilitários
  const getDeliveryById = (saleId: string): DeliveryItem | undefined => {
    return deliveryItems.find(item => item.id === saleId);
  };

  const getDeliveriesByStatus = (status: DeliveryItem['deliveryStatus']): DeliveryItem[] => {
    return deliveryItems.filter(item => item.deliveryStatus === status);
  };

  const contextValue: DeliveryContextType = {
    // Estados
    pendingDeliveries,
    shippedDeliveries,
    deliveredItems,
    
    // Ações
    updateDeliveryDate,
    confirmShipment,
    confirmDelivery,
    cancelDelivery,
    
    // Utilitários
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