import { api } from './api';
import { Sale } from '../@types/entities';

interface CreateSaleProduct {
  productId: string;
  quantity: number;
  price: number;
}

interface CreateSaleData {
  clientId: string;
  products: CreateSaleProduct[];
  total: number;
  paymentType?: string;
}

export const saleService = {
  async create(saleData: CreateSaleData) {
    if (!saleData.clientId || !saleData.products.length || saleData.total <= 0) {
      throw new Error('Dados da venda incompletos');
    }

    try {
      const response = await api.post('/sales', saleData);
      return response.data;
    } catch (error: any) {
      console.error('Erro ao criar venda:', {
        data: error.response?.data,
        status: error.response?.status
      });
      throw error;
    }
  },

  async list() {
    try {
      const response = await api.get('/sales');
      return response.data;
    } catch (error: any) {
      console.error('Erro ao listar vendas:', {
        data: error.response?.data,
        status: error.response?.status
      });
      throw error;
    }
  },

  async findById(id: string) {
    try {
      const response = await api.get(`/sales/${id}`);
      return response.data;
    } catch (error: any) {
      console.error('Erro ao buscar venda:', {
        data: error.response?.data,
        status: error.response?.status
      });
      throw error;
    }
  },

  async updateStatus(id: string, status: string) {
    try {
      const response = await api.patch(`/sales/${id}/status`, { status });
      return response.data;
    } catch (error: any) {
      console.error('Erro ao atualizar status da venda:', {
        data: error.response?.data,
        status: error.response?.status
      });
      throw error;
    }
  },

  async listByClient(clientId: string) {
    try {
      const response = await api.get(`/sales/client/${clientId}`);
      return response.data;
    } catch (error: any) {
      console.error('Erro ao listar vendas do cliente:', {
        data: error.response?.data,
        status: error.response?.status
      });
      throw error;
    }
  }
}; 