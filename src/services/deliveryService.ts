import { api } from './api';
import { Delivery } from '../@types/entities';

interface CreateDeliveryData {
  saleId: string;
  date: Date;
  address: string;
  status?: string;
}

export const deliveryService = {
  async create(deliveryData: CreateDeliveryData) {
    if (!deliveryData.saleId || !deliveryData.date || !deliveryData.address) {
      throw new Error('Dados da entrega incompletos');
    }

    try {
      const response = await api.post('/delivery', deliveryData);
      return response.data;
    } catch (error: any) {
      console.error('Erro ao criar entrega:', {
        data: error.response?.data,
        status: error.response?.status
      });
      throw error;
    }
  },

  async list() {
    try {
      const response = await api.get('/delivery');
      return response.data;
    } catch (error: any) {
      console.error('Erro ao listar entregas:', {
        data: error.response?.data,
        status: error.response?.status
      });
      throw error;
    }
  },

  async findById(id: string) {
    try {
      const response = await api.get(`/delivery/${id}`);
      return response.data;
    } catch (error: any) {
      console.error('Erro ao buscar entrega:', {
        data: error.response?.data,
        status: error.response?.status
      });
      throw error;
    }
  },

  async updateStatus(id: string, status: string) {
    try {
      const response = await api.patch(`/delivery/${id}/status`, { status });
      return response.data;
    } catch (error: any) {
      console.error('Erro ao atualizar status da entrega:', {
        data: error.response?.data,
        status: error.response?.status
      });
      throw error;
    }
  }
}; 