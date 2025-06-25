import { api } from './api';
import { Client } from '../@types/entities';

export const clientService = {
  async create(client: Omit<Client, 'id' | 'createdAt' | 'updatedAt' | 'sales'>) {
    if (!client.name) {
      throw new Error('Nome é obrigatório');
    }

    try {
      const response = await api.post('/clients', client);
      return response.data;
    } catch (error: any) {
      console.error('Erro ao criar cliente:', {
        data: error.response?.data,
        status: error.response?.status
      });
      throw error;
    }
  },

  async list() {
    try {
      const response = await api.get('/clients');
      return response.data;
    } catch (error: any) {
      console.error('Erro ao listar clientes:', {
        data: error.response?.data,
        status: error.response?.status
      });
      throw error;
    }
  },

  async findById(id: string) {
    try {
      const response = await api.get(`/clients/${id}`);
      return response.data;
    } catch (error: any) {
      console.error('Erro ao buscar cliente:', {
        data: error.response?.data,
        status: error.response?.status
      });
      throw error;
    }
  },

  async search(query: string) {
    try {
      const response = await api.get('/clients/search', {
        params: { q: query }
      });
      return response.data;
    } catch (error: any) {
      console.error('Erro ao pesquisar clientes:', {
        data: error.response?.data,
        status: error.response?.status
      });
      throw error;
    }
  },

  async delete(id: string) {
    try {
      await api.delete(`/clients/${id}`);
    } catch (error: any) {
      console.error('Erro ao deletar cliente:', {
        data: error.response?.data,
        status: error.response?.status
      });
      throw error;
    }
  }
}; 