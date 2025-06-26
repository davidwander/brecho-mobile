import { api } from '@services/api';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface User {
  id: string;
  name: string;
  email: string;
}

interface AuthResponse {
  user: User;
  accessToken: string;
  refreshToken: string;
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

      if (!response.data.accessToken || !response.data.refreshToken || !response.data.user) {
        throw new Error('Resposta inválida do servidor: tokens ou dados do usuário ausentes');
      }

      // Salva os tokens e usuário no AsyncStorage
      await AsyncStorage.multiSet([
        ['@brecho:token', `Bearer ${response.data.accessToken}`],
        ['@brecho:refreshToken', response.data.refreshToken],
        ['@brecho:user', JSON.stringify(response.data.user)]
      ]);

      // Configura o token no axios
      api.defaults.headers.Authorization = `Bearer ${response.data.accessToken}`;

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
      console.log('Tentando fazer login com:', {
        email: data.email,
        url: '/auth/login'
      });

      const response = await api.post<AuthResponse>('/auth/login', {
        email: data.email.trim().toLowerCase(),
        password: data.password
      });

      console.log('Resposta do login recebida:', {
        status: response.status,
        headers: response.headers,
        dataType: typeof response.data,
        hasData: !!response.data,
        hasUser: !!response.data?.user,
        hasAccessToken: !!response.data?.accessToken,
        hasRefreshToken: !!response.data?.refreshToken
      });

      // Validação da resposta
      if (!response.data) {
        throw new Error('Resposta vazia do servidor');
      }

      const { user, accessToken, refreshToken } = response.data;

      if (!user || !accessToken || !refreshToken) {
        console.error('Dados ausentes na resposta:', response.data);
        throw new Error('Resposta inválida do servidor: dados ausentes');
      }

      if (!user.id || !user.name || !user.email) {
        console.error('Dados do usuário inválidos:', user);
        throw new Error('Dados do usuário inválidos ou incompletos');
      }

      // Salva os tokens e usuário no AsyncStorage
      await AsyncStorage.multiSet([
        ['@brecho:token', `Bearer ${accessToken}`],
        ['@brecho:refreshToken', refreshToken],
        ['@brecho:user', JSON.stringify(user)]
      ]);

      // Configura o token no axios
      api.defaults.headers.Authorization = `Bearer ${accessToken}`;

      console.log('Login realizado com sucesso para:', user.email);

      return response.data;
    } catch (error: any) {
      console.error('Erro detalhado no login:', {
        name: error.name,
        message: error.message,
        isAxiosError: error.isAxiosError,
        stack: error.stack,
        fullError: error
      });

      if (!error.response) {
        throw new Error('Erro de conexão. Verifique sua internet e tente novamente');
      }

      if (error.response.status === 401) {
        throw new Error('Email ou senha incorretos');
      }

      if (error.response.status === 400) {
        const errorMessage = error.response.data?.error || 'Dados inválidos';
        throw new Error(errorMessage);
      }

      if (error.response.status === 500) {
        throw new Error('Erro no servidor. Tente novamente mais tarde');
      }

      throw new Error('Não foi possível fazer login. Tente novamente');
    }
  },

  async validate(): Promise<User> {
    try {
      console.log('Iniciando validação de token...');
      const response = await api.get<{ user: User }>('/auth/validate');
      
      if (!response.data?.user) {
        console.error('Resposta da validação sem dados do usuário:', response.data);
        throw new Error('Dados do usuário ausentes na validação');
      }

      console.log('Token validado com sucesso:', {
        userId: response.data.user.id,
        userName: response.data.user.name
      });

      return response.data.user;
    } catch (error: any) {
      console.error('Erro ao validar token:', {
        name: error.name,
        message: error.message,
        response: {
          data: error.response?.data,
          status: error.response?.status,
          headers: error.response?.headers
        }
      });

      if (!error.response) {
        throw new Error('Erro de conexão ao validar token');
      }

      if (error.response.status === 401) {
        throw new Error('Token inválido ou expirado');
      }

      throw new Error('Erro ao validar token');
    }
  },

  async logout(): Promise<void> {
    try {
      await AsyncStorage.multiRemove(['@brecho:token', '@brecho:refreshToken', '@brecho:user']);
      delete api.defaults.headers.Authorization;
    } catch (error) {
      console.error('Erro ao fazer logout:', error);
      throw error;
    }
  }
}; 