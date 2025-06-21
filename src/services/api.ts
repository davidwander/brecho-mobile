import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_URL } from '../config/env';

export const api = axios.create({
  baseURL: API_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor para adicionar o token de autenticação
api.interceptors.request.use(
  async (config) => {
    try {
      const token = await AsyncStorage.getItem('@brecho:token');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
      return config;
    } catch (error) {
      console.error('Erro ao adicionar token:', error);
      return config;
    }
  },
  (error) => {
    console.error('Erro na requisição:', error);
    return Promise.reject(error);
  }
);

// Interceptor para tratar respostas
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response) {
      // O servidor respondeu com um status de erro
      console.error('Erro na resposta:', {
        status: error.response.status,
        data: error.response.data
      });

      // Se o token expirou ou é inválido
      if (error.response.status === 401) {
        await AsyncStorage.multiRemove(['@brecho:token', '@brecho:user']);
      }
    } else if (error.request) {
      // A requisição foi feita mas não houve resposta
      console.error('Sem resposta do servidor:', error.request);
    } else {
      // Erro na configuração da requisição
      console.error('Erro na configuração:', error.message);
    }

    return Promise.reject(error);
  }
); 