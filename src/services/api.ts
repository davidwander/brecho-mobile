import axios, { InternalAxiosRequestConfig } from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_URL } from '../config/env';

console.log('Configurando API com URL:', API_URL);

export const api = axios.create({
  baseURL: API_URL,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor para adicionar o token de autenticação
api.interceptors.request.use(
  async (config: InternalAxiosRequestConfig) => {
    try {
      console.log(`Preparando requisição para: ${config.method?.toUpperCase()} ${config.url}`, {
        headers: config.headers,
        data: config.data ? JSON.stringify(config.data).substring(0, 100) + '...' : undefined
      });
      
      const token = await AsyncStorage.getItem('@brecho:token');
      
      if (token) {
        console.log('Token encontrado:', token.substring(0, 10) + '...');
        config.headers.Authorization = `Bearer ${token}`;
      } else {
        console.log('Nenhum token encontrado para a requisição');
        config.headers.Authorization = undefined;
      }

      // Log dos headers da requisição
      console.log('Headers finais da requisição:', {
        Accept: config.headers.Accept,
        Authorization: config.headers.Authorization ? 'Bearer [REDACTED]' : 'Não definido',
        'Content-Type': config.headers['Content-Type']
      });

      return config;
    } catch (error) {
      console.error('Erro ao processar requisição:', error);
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
    try {
      console.log('Processando resposta:', {
        url: response.config.url,
        method: response.config.method,
        status: response.status,
        dataType: typeof response.data,
        hasData: !!response.data,
        dataKeys: response.data ? Object.keys(response.data) : [],
        rawData: response.data
      });

      // Se a resposta é um objeto e tem a propriedade data, retorna apenas o data
      if (response.data && typeof response.data === 'object' && 'data' in response.data) {
        console.log('Extraindo dados do objeto data:', {
          beforeExtraction: response.data,
          extractedData: response.data.data
        });
        response.data = response.data.data;
      }

      console.log('Dados finais da resposta:', {
        hasData: !!response.data,
        dataType: typeof response.data,
        dataKeys: response.data ? Object.keys(response.data) : []
      });

      return response;
    } catch (error) {
      console.error('Erro ao processar resposta:', {
        error,
        errorType: typeof error,
        errorMessage: error instanceof Error ? error.message : 'Erro desconhecido',
        errorStack: error instanceof Error ? error.stack : undefined
      });
      throw error; // Propaga o erro para ser tratado no serviço
    }
  },
  async (error) => {
    const originalRequest = error.config;

    // Se o erro for 401 (Unauthorized) e não for uma tentativa de refresh
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        // Tentar fazer refresh do token
        const refreshToken = await AsyncStorage.getItem('@brecho:refreshToken');
        const response = await api.post('/auth/refresh-token', {
          refreshToken,
        });

        const { token, newRefreshToken } = response.data;

        // Salvar os novos tokens
        await AsyncStorage.setItem('@brecho:token', token);
        await AsyncStorage.setItem('@brecho:refreshToken', newRefreshToken);

        // Atualizar o header com o novo token
        api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
        originalRequest.headers['Authorization'] = `Bearer ${token}`;

        // Repetir a requisição original com o novo token
        return api(originalRequest);
      } catch (refreshError) {
        // Se o refresh falhar, fazer logout
        await AsyncStorage.multiRemove(['@brecho:token', '@brecho:refreshToken']);
        // Você precisará implementar uma forma de redirecionar para o login
        // e notificar o contexto de autenticação
        return Promise.reject(refreshError);
      }
    }

    if (error.response) {
      // O servidor respondeu com um status de erro
      console.error('Erro na resposta:', {
        url: error.config?.url,
        method: error.config?.method,
        status: error.response.status,
        data: error.response.data,
        headers: {
          request: error.config?.headers,
          response: error.response.headers
        }
      });

      // Se o token expirou ou é inválido
      if (error.response.status === 401) {
        console.log('Token inválido ou expirado, removendo dados de autenticação...');
        await AsyncStorage.multiRemove(['@brecho:token', '@brecho:user']);
      }
    } else if (error.request) {
      // A requisição foi feita mas não houve resposta
      console.error('Sem resposta do servidor:', {
        url: error.config?.url,
        method: error.config?.method,
        timeout: error.config?.timeout,
        headers: error.config?.headers
      });
    } else {
      // Erro na configuração da requisição
      console.error('Erro na configuração:', {
        message: error.message,
        config: error.config
      });
    }

    return Promise.reject(error);
  }
);

export default api; 