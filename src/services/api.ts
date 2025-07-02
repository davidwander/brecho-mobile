import axios, { InternalAxiosRequestConfig } from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_URL } from '../config/env';
import { testApiConnection } from '../config/env';

// Testa a conexão com a API antes de configurar
testApiConnection().then(isConnected => {
  if (!isConnected) {
    console.error('Não foi possível conectar à API. Verifique se o servidor está rodando e acessível.');
  }
});

export const api = axios.create({
  baseURL: API_URL,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json'
  },
});

// Interceptor para adicionar o token de autenticação
api.interceptors.request.use(
  async (config: InternalAxiosRequestConfig) => {
    try {
      const token = await AsyncStorage.getItem('@brecho:token');
      
      if (token) {
        config.headers.Authorization = token.startsWith('Bearer ') ? token : `Bearer ${token}`;
        console.log(`Requisição autenticada: ${config.method?.toUpperCase()} ${config.url}`);
      } else {
        console.log(`Requisição não autenticada: ${config.method?.toUpperCase()} ${config.url}`);
      }

      return config;
    } catch (error) {
      console.error('Erro ao processar token na requisição:', error);
      return config;
    }
  },
  (error) => {
    console.error('Erro na configuração da requisição:', error);
    return Promise.reject(error);
  }
);

// Interceptor para tratar respostas e erros
api.interceptors.response.use(
  (response) => {
    return response;
  },
  async (error) => {
    const originalRequest = error.config;

    // Se não há resposta do servidor
    if (!error.response) {
      console.error('Erro de conexão:', {
        url: originalRequest?.url,
        method: originalRequest?.method,
        error: error.message
      });
      return Promise.reject(new Error('Erro de conexão. Verifique sua internet e se o servidor está acessível.'));
    }

    // Verifica se é erro de token expirado e não é uma tentativa de refresh
    if (
      error.response?.status === 401 && 
      error.response?.data?.code === 'TOKEN_EXPIRED' && 
      !originalRequest._retry
    ) {
      originalRequest._retry = true;

      try {
        console.log('Token expirado, tentando refresh...');
        const refreshToken = await AsyncStorage.getItem('@brecho:refreshToken');

        if (!refreshToken) {
          console.log('Refresh token não encontrado');
          await AsyncStorage.multiRemove(['@brecho:token', '@brecho:refreshToken', '@brecho:user']);
          return Promise.reject(new Error('SESSION_EXPIRED'));
        }

        const response = await api.post('/auth/refresh-token', {
          refreshToken,
        });

        if (!response.data?.accessToken || !response.data?.refreshToken) {
          throw new Error('Resposta inválida do refresh token');
        }

        const { accessToken: newAccessToken, refreshToken: newRefreshToken } = response.data;

        // Salva os novos tokens
        await AsyncStorage.multiSet([
          ['@brecho:token', `Bearer ${newAccessToken}`],
          ['@brecho:refreshToken', newRefreshToken]
        ]);

        // Atualiza o header de autorização
        api.defaults.headers.Authorization = `Bearer ${newAccessToken}`;
        originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;

        console.log('Token atualizado com sucesso');
        return api(originalRequest);
      } catch (refreshError) {
        console.error('Erro ao fazer refresh do token:', refreshError);
        await AsyncStorage.multiRemove(['@brecho:token', '@brecho:refreshToken', '@brecho:user']);
        return Promise.reject(new Error('SESSION_EXPIRED'));
      }
    }

    // Trata outros erros de autenticação
    if (error.response?.status === 401) {
      console.log('Erro de autenticação');
      await AsyncStorage.multiRemove(['@brecho:token', '@brecho:refreshToken', '@brecho:user']);
      return Promise.reject(new Error('AUTH_ERROR'));
    }

    // Trata erros específicos
    if (error.response?.data?.error) {
      return Promise.reject(new Error(error.response.data.error));
    }

    // Erro genérico
    return Promise.reject(error);
  }
);

export default api; 