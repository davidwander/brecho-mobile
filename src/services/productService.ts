import { api } from './api';
import { Product } from '../@types/entities';

const formatProductData = (product: Omit<Product, 'id' | 'createdAt' | 'updatedAt'>) => {
  return {
    ...product,
    costPrice: Number(product.costPrice.toFixed(2)),
    salePrice: Number(product.salePrice.toFixed(2)),
    profitMargin: Number(product.profitMargin.toFixed(2)),
    quantity: Math.floor(product.quantity),
    reserved: false,
    sold: false
  };
};

export const productService = {
  async create(product: Omit<Product, 'id' | 'createdAt' | 'updatedAt'>) {
    // Validação dos dados
    if (!product.name || !product.type || !product.description) {
      throw new Error('Campos obrigatórios não preenchidos');
    }

    if (product.costPrice <= 0 || product.profitMargin < 0 || product.salePrice <= 0) {
      throw new Error('Valores de preço ou margem inválidos');
    }

    if (product.quantity <= 0) {
      throw new Error('Quantidade deve ser maior que zero');
    }

    const formattedProduct = formatProductData(product);
    console.log('Enviando produto formatado:', formattedProduct);

    try {
      const response = await api.post('/products', formattedProduct);
      return response.data;
    } catch (error: any) {
      console.error('Erro na requisição:', {
        data: error.response?.data,
        status: error.response?.status,
        headers: error.response?.headers
      });
      throw error;
    }
  },

  async list() {
    const response = await api.get('/products');
    return response.data;
  },

  async update(id: string, data: Partial<Product>) {
    const response = await api.put(`/products/${id}`, data);
    return response.data;
  },

  async updateStock(id: string, quantity: number) {
    const response = await api.patch(`/products/${id}/stock`, { quantity });
    return response.data;
  },

  async delete(id: string) {
    await api.delete(`/products/${id}`);
  }
}; 