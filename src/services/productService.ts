import { api } from './api';
import { Product } from '../@types/entities';
import { PRODUCT_STATUS, ProductStatus } from '../constants/status';
import AsyncStorage from '@react-native-async-storage/async-storage';

const formatProductData = (product: Omit<Product, 'id' | 'createdAt' | 'updatedAt'>) => {
  return {
    ...product,
    costPrice: Number(product.costPrice.toFixed(2)),
    salePrice: Number(product.salePrice.toFixed(2)),
    profitMargin: Number(product.profitMargin.toFixed(2)),
    quantity: Math.floor(product.quantity),
    status: product.status || PRODUCT_STATUS.AVAILABLE,
    reserved: product.reserved || false,
    sold: product.sold || false,
    code: product.code || null
  };
};

export const productService = {
  async create(product: Omit<Product, 'id' | 'createdAt' | 'updatedAt'>) {
    console.log('Iniciando criação de produto...');

    // Validação dos dados
    if (!product.name || !product.type) {
      throw new Error('Nome e tipo são obrigatórios');
    }

    if (product.costPrice <= 0 || product.profitMargin < 0 || product.salePrice <= 0) {
      throw new Error('Valores de preço ou margem inválidos');
    }

    if (product.quantity <= 0) {
      throw new Error('Quantidade deve ser maior que zero');
    }

    const formattedProduct = formatProductData(product);
    console.log('Produto formatado:', formattedProduct);

    try {
      console.log('Enviando requisição para criar produto...');
      const response = await api.post('/products', formattedProduct);
      
      console.log('Resposta da criação do produto:', {
        status: response.status,
        data: response.data,
        headers: response.headers
      });

      if (!response.data) {
        throw new Error('Resposta vazia do servidor');
      }

      return response.data;
    } catch (error: any) {
      console.error('Erro na criação do produto:', {
        data: error.response?.data,
        status: error.response?.status,
        headers: error.response?.headers,
        message: error.message
      });
      throw error;
    }
  },

  async list() {
    try {
      console.log('Iniciando busca de produtos...');
      
      const token = await AsyncStorage.getItem('@brecho:token');
      if (!token) {
        console.error('Tentativa de listar produtos sem token de autenticação');
        throw new Error('Usuário não autenticado');
      }

      console.log('Token encontrado, fazendo requisição...');
      const response = await api.get('/products');
      
      console.log('Resposta da listagem de produtos:', {
        status: response.status,
        quantidade: response.data?.length || 0,
        headers: response.headers
      });

      if (!response.data) {
        console.warn('Resposta vazia da API');
        return [];
      }

      return response.data;
    } catch (error: any) {
      console.error('Erro ao listar produtos:', {
        status: error.response?.status,
        data: error.response?.data,
        headers: error.response?.headers,
        message: error.message
      });
      throw error;
    }
  },

  async findById(id: string) {
    try {
      const response = await api.get(`/products/${id}`);
      return response.data;
    } catch (error: any) {
      console.error('Erro ao buscar produto:', {
        id,
        status: error.response?.status,
        data: error.response?.data
      });
      throw error;
    }
  },

  async updateStatus(id: string, status: ProductStatus) {
    if (!Object.values(PRODUCT_STATUS).includes(status)) {
      throw new Error(`Status inválido. Use um dos seguintes: ${Object.values(PRODUCT_STATUS).join(', ')}`);
    }

    try {
      const response = await api.patch(`/products/${id}/status`, { status });
      return response.data;
    } catch (error: any) {
      console.error('Erro ao atualizar status:', {
        id,
        status,
        error: error.response?.data
      });
      throw error;
    }
  },

  async updateStock(id: string, quantity: number) {
    if (quantity < 0) {
      throw new Error('Quantidade não pode ser negativa');
    }

    try {
      const response = await api.patch(`/products/${id}/stock`, { quantity });
      return response.data;
    } catch (error: any) {
      console.error('Erro ao atualizar estoque:', {
        id,
        quantity,
        error: error.response?.data
      });
      throw error;
    }
  }
}; 