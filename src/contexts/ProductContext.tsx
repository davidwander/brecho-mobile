import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Product } from '../interfaces/Product';
import { productService } from '../services/productService';
import { useToast, Toast, Text } from '@gluestack-ui/themed';
import { socketService } from '../services/socketService';

type ProductContextType = {
  products: Product[];
  addProduct: (product: Omit<Product, 'id' | 'createdAt' | 'updatedAt'>) => Promise<void>;
  removeProduct: (id: string) => Promise<void>;
  updateStock: (id: string, quantity: number) => Promise<void>;
  loading: boolean;
  error: string | null;
};

const ProductContext = createContext<ProductContextType | undefined>(undefined);

type Props = {
  children: ReactNode;
};

export const ProductProvider = ({ children }: Props) => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const toast = useToast();

  // Carregar produtos ao iniciar e configurar listeners do Socket.IO
  useEffect(() => {
    loadProducts();

    // Configurar listeners do Socket.IO para atualizações em tempo real
    socketService.on('product:created', (newProduct: Product) => {
      setProducts(prev => [...prev, newProduct]);
    });

    socketService.on('product:updated', (updatedProduct: Product) => {
      setProducts(prev => 
        prev.map(product => 
          product.id === updatedProduct.id ? updatedProduct : product
        )
      );
    });

    socketService.on('product:deleted', (deletedProductId: string) => {
      setProducts(prev => prev.filter(product => product.id !== deletedProductId));
    });

    socketService.on('product:stock_updated', (data: { id: string, quantity: number }) => {
      setProducts(prev => 
        prev.map(product => 
          product.id === data.id 
            ? { ...product, quantity: data.quantity }
            : product
        )
      );
    });

    // Cleanup dos listeners quando o componente for desmontado
    return () => {
      socketService.off('product:created');
      socketService.off('product:updated');
      socketService.off('product:deleted');
      socketService.off('product:stock_updated');
    };
  }, []);

  const loadProducts = async () => {
    try {
      setLoading(true);
      const data = await productService.list();
      setProducts(data);
      setError(null);
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || 'Erro ao carregar produtos';
      setError(errorMessage);
      showErrorToast(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const showSuccessToast = (message: string) => {
    toast.show({
      placement: "bottom",
      render: () => (
        <Toast action="success" variant="solid">
          <Text color="$white">{message}</Text>
        </Toast>
      )
    });
  };

  const showErrorToast = (message: string) => {
    toast.show({
      placement: "bottom",
      render: () => (
        <Toast action="error" variant="solid">
          <Text color="$white">{message}</Text>
        </Toast>
      )
    });
  };

  const addProduct = async (product: Omit<Product, 'id' | 'createdAt' | 'updatedAt'>) => {
    try {
      setLoading(true);
      
      // Validação dos dados antes de enviar
      if (!product.name || !product.type || !product.description) {
        throw new Error('Campos obrigatórios não preenchidos');
      }

      if (product.costPrice <= 0 || product.profitMargin < 0 || product.salePrice <= 0) {
        throw new Error('Valores de preço ou margem inválidos');
      }

      if (product.quantity <= 0) {
        throw new Error('Quantidade deve ser maior que zero');
      }

      // Log dos dados sendo enviados
      console.log('Enviando produto:', {
        ...product,
        costPrice: Number(product.costPrice.toFixed(2)),
        salePrice: Number(product.salePrice.toFixed(2)),
        profitMargin: Number(product.profitMargin.toFixed(2)),
        quantity: Math.floor(product.quantity)
      });

      const newProduct = await productService.create({
        ...product,
        costPrice: Number(product.costPrice.toFixed(2)),
        salePrice: Number(product.salePrice.toFixed(2)),
        profitMargin: Number(product.profitMargin.toFixed(2)),
        quantity: Math.floor(product.quantity),
        reserved: false,
        sold: false
      });
      
      // Atualiza o estado local apenas após confirmação do backend
      setProducts(prev => [...prev, newProduct]);
      
      // Emite evento para outros clientes
      socketService.emit('product:create', newProduct);
      
      showSuccessToast('Produto adicionado com sucesso!');
      setError(null);
      
      return newProduct;
    } catch (err: any) {
      console.error('Erro detalhado:', {
        message: err.message,
        response: err.response?.data,
        status: err.response?.status,
        headers: err.response?.headers
      });

      let errorMessage = 'Erro ao adicionar produto';
      
      if (err.response?.data?.message) {
        errorMessage = err.response.data.message;
      } else if (err.message) {
        errorMessage = err.message;
      }

      setError(errorMessage);
      showErrorToast(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const removeProduct = async (id: string) => {
    try {
      setLoading(true);
      await productService.delete(id);
      
      // Atualiza o estado local apenas após confirmação do backend
      setProducts(prev => prev.filter(product => product.id !== id));
      
      // Emite evento para outros clientes
      socketService.emit('product:delete', id);
      
      showSuccessToast('Produto removido com sucesso!');
      setError(null);
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || 'Erro ao remover produto';
      setError(errorMessage);
      showErrorToast(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const updateStock = async (id: string, quantity: number) => {
    try {
      setLoading(true);
      const updatedProduct = await productService.updateStock(id, quantity);
      
      // Atualiza o estado local apenas após confirmação do backend
      setProducts(prev => 
        prev.map(product => 
          product.id === id ? updatedProduct : product
        )
      );
      
      // Emite evento para outros clientes
      socketService.emit('product:update_stock', { id, quantity });
      
      showSuccessToast('Estoque atualizado com sucesso!');
      setError(null);
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || 'Erro ao atualizar estoque';
      setError(errorMessage);
      showErrorToast(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return (
    <ProductContext.Provider 
      value={{ 
        products, 
        addProduct, 
        removeProduct,
        updateStock,
        loading,
        error
      }}
    >
      {children}
    </ProductContext.Provider>
  );
};

export const useProduct = () => {
  const context = useContext(ProductContext);
  if (!context) {
    throw new Error('useProduct deve ser usado dentro de um ProductProvider');
  }
  return context;
};