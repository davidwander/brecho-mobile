import { api } from '@services/api';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface User {
  id: string;
  name: string;
  email: string;
}

interface AuthResponse {
  user: User;
  token: string;
}

interface RegisterData {
  name: string;
  email: string;
  password: string;
}

interface LoginData {
  email: string;
  password: string;
}

export const authService = {
  async register(data: RegisterData): Promise<AuthResponse> {
    console.log('Iniciando registro de usuário...');
    
    // Validação dos dados
    if (!data.name?.trim()) {
      throw new Error('Nome é obrigatório');
    }
    if (!data.email?.trim()) {
      throw new Error('Email é obrigatório');
    }
    if (!data.password?.trim()) {
      throw new Error('Senha é obrigatória');
    }
    if (data.password.length < 6) {
      throw new Error('A senha deve ter no mínimo 6 caracteres');
    }

    try {
      // Formata os dados antes de enviar
      const formattedData = {
        name: data.name.trim(),
        email: data.email.trim().toLowerCase(),
        password: data.password
      };

      console.log('Enviando dados para registro:', {
        url: '/auth/register',
        data: { ...formattedData, password: '[REDACTED]' },
        headers: api.defaults.headers
      });

      const response = await api.post<AuthResponse>('/auth/register', formattedData);
      
      console.log('Resposta do registro:', {
        status: response.status,
        headers: response.headers,
        data: { ...response.data, token: '[REDACTED]' }
      });

      if (!response.data.token || !response.data.user) {
        throw new Error('Resposta inválida do servidor: token ou dados do usuário ausentes');
      }

      // Salva o token e usuário no AsyncStorage
      await AsyncStorage.multiSet([
        ['@brecho:token', response.data.token],
        ['@brecho:user', JSON.stringify(response.data.user)]
      ]);

      console.log('Dados do usuário salvos localmente');
      return response.data;
    } catch (error: any) {
      console.error('Erro detalhado ao registrar:', {
        status: error.response?.status,
        data: error.response?.data,
        headers: error.response?.headers,
        message: error.message,
        stack: error.stack
      });

      // Tratamento de erros específicos
      if (error.response?.status === 400) {
        const errorMessage = error.response.data?.error;
        if (errorMessage?.includes('já cadastrado') || errorMessage?.includes('already exists')) {
          throw new Error('Este email já está em uso');
        }
        if (errorMessage?.includes('inválido')) {
          throw new Error(errorMessage);
        }
        throw new Error(errorMessage || 'Dados inválidos para registro');
      }

      if (error.response?.status === 409) {
        throw new Error('Este email já está em uso');
      }

      if (error.response?.status === 500) {
        throw new Error('Erro no servidor. Tente novamente mais tarde');
      }

      if (!error.response) {
        throw new Error('Erro de conexão. Verifique sua internet e tente novamente');
      }

      throw new Error('Não foi possível realizar o registro. Tente novamente');
    }
  },

  async login(data: LoginData): Promise<AuthResponse> {
    if (!data.email || !data.password) {
      throw new Error('Email e senha são obrigatórios');
    }

    try {
      const response = await api.post<AuthResponse>('/auth/login', {
        email: data.email.trim().toLowerCase(),
        password: data.password
      });
      
      // Salva o token e usuário no AsyncStorage
      await AsyncStorage.multiSet([
        ['@brecho:token', response.data.token],
        ['@brecho:user', JSON.stringify(response.data.user)]
      ]);

      return response.data;
    } catch (error: any) {
      console.error('Erro ao fazer login:', {
        data: error.response?.data,
        status: error.response?.status
      });
      throw error;
    }
  },

  async validate(): Promise<User> {
    try {
      const response = await api.get<{ user: User }>('/auth/validate');
      return response.data.user;
    } catch (error: any) {
      console.error('Erro ao validar token:', {
        data: error.response?.data,
        status: error.response?.status
      });
      throw error;
    }
  },

  async logout(): Promise<void> {
    try {
      await AsyncStorage.multiRemove(['@brecho:token', '@brecho:user']);
    } catch (error) {
      console.error('Erro ao fazer logout:', error);
      throw error;
    }
  }
}; 