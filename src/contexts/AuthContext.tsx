import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { api } from '../services/api';
import { socketService } from '../services/socketService';
import { Alert } from 'react-native';

interface User {
  id: string;
  name: string;
  email: string;
}

interface AuthState {
  token: string;
  user: User;
  refreshToken: string;
}

interface SignInCredentials {
  email: string;
  password: string;
}

interface SignUpCredentials {
  name: string;
  email: string;
  password: string;
}

interface AuthContextData {
  signed: boolean;
  user: User | null;
  loading: boolean;
  signIn: (credentials: SignInCredentials) => Promise<void>;
  signUp: (credentials: SignUpCredentials) => Promise<void>;
  signOut: () => Promise<void>;
  refreshSession: () => Promise<void>;
}

const AuthContext = createContext<AuthContextData>({} as AuthContextData);

export const AuthProvider: React.FC = ({ children }) => {
  const [data, setData] = useState<AuthState>({} as AuthState);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadStorageData(): Promise<void> {
      try {
        console.log('Verificando token armazenado...');
        const [token, user] = await AsyncStorage.multiGet([
          '@brecho:token',
          '@brecho:user',
        ]);

        if (token[1] && user[1]) {
          try {
            console.log('Token encontrado:', token[1].substring(0, 10) + '...');
            
            // Adiciona o token no header das requisições
            api.defaults.headers.authorization = token[1]; // Token já está com "Bearer "
            console.log('Token adicionado aos headers da API');
            
            // Faz uma requisição para verificar se o token ainda é válido
            const response = await api.get('/auth/validate');
            console.log('Token validado com sucesso');
            
            const userData = JSON.parse(user[1]);
            setData({ token: token[1], user: userData, refreshToken: '' });

            // Conecta ao Socket.IO após validar o token
            await socketService.connect();
          } catch (error: any) {
            console.error('Erro ao validar token:', {
              status: error.response?.status,
              data: error.response?.data,
              headers: error.response?.headers
            });
            // Se o token não for válido, remove os dados do storage
            await signOut();
          }
        } else {
          console.log('Nenhum token encontrado no storage');
        }
      } catch (error) {
        console.error('Erro ao carregar dados do storage:', error);
        await signOut();
      } finally {
        setLoading(false);
      }
    }

    loadStorageData();

    // Desconecta o Socket.IO quando o componente for desmontado
    return () => {
      socketService.disconnect();
    };
  }, []);

  const signIn = async ({ email, password }: SignInCredentials) => {
    try {
      console.log('Iniciando processo de login...');
      
      const response = await api.post('/auth/login', {
        email,
        password,
      });

      const { token, user: userData, refreshToken } = response.data;
      console.log('Login bem sucedido. Token recebido:', token.substring(0, 10) + '...');

      console.log('Salvando token no AsyncStorage...');
      await AsyncStorage.multiSet([
        ['@brecho:token', `Bearer ${token}`],
        ['@brecho:user', JSON.stringify(userData)],
        ['@brecho:refreshToken', refreshToken],
      ]);

      console.log('Configurando token nos headers da API...');
      api.defaults.headers.authorization = `Bearer ${token}`;
      setData({ token, user: userData, refreshToken });

      // Conecta ao Socket.IO após o login
      await socketService.connect();
      console.log('Login completo e token configurado');
    } catch (error: any) {
      console.error('Erro detalhado no login:', {
        status: error.response?.status,
        data: error.response?.data,
        headers: error.response?.headers
      });
      throw new Error(error.response?.data?.message || 'Erro ao fazer login');
    }
  };

  const signUp = async ({ name, email, password }: SignUpCredentials) => {
    try {
      console.log('Iniciando processo de registro...', {
        name,
        email,
        passwordLength: password.length
      });

      // Validações básicas
      if (!name?.trim()) {
        throw new Error('Nome é obrigatório');
      }
      if (!email?.trim()) {
        throw new Error('Email é obrigatório');
      }
      if (!password?.trim()) {
        throw new Error('Senha é obrigatória');
      }
      if (password.length < 6) {
        throw new Error('A senha deve ter no mínimo 6 caracteres');
      }

      // Formata os dados antes de enviar
      const formattedData = {
        name: name.trim(),
        email: email.trim().toLowerCase(),
        password: password
      };

      console.log('Enviando requisição para registro:', {
        url: '/auth/register',
        data: { ...formattedData, password: '[REDACTED]' }
      });
      
      const response = await api.post('/auth/register', formattedData);

      console.log('Resposta do registro:', {
        status: response.status,
        headers: response.headers,
        data: { ...response.data, token: response.data.token ? '[REDACTED]' : undefined }
      });

      if (!response.data.token || !response.data.user) {
        throw new Error('Resposta inválida do servidor: token ou dados do usuário ausentes');
      }

      const { token, user } = response.data;

      console.log('Salvando dados do usuário...');
      await AsyncStorage.multiSet([
        ['@brecho:token', `Bearer ${token}`],
        ['@brecho:user', JSON.stringify(user)],
        ['@brecho:refreshToken', response.data.refreshToken],
      ]);

      console.log('Configurando token na API...');
      api.defaults.headers.authorization = `Bearer ${token}`;
      setData({ token, user, refreshToken: response.data.refreshToken });

      // Conecta ao Socket.IO após o registro
      console.log('Conectando ao Socket.IO...');
      await socketService.connect();
      
      console.log('Registro concluído com sucesso');
    } catch (error: any) {
      console.error('Erro detalhado no registro:', {
        status: error.response?.status,
        data: error.response?.data,
        headers: error.response?.headers,
        message: error.message,
        stack: error.stack
      });

      // Tratamento específico de erros
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
  };

  const signOut = async () => {
    try {
      console.log('Iniciando processo de logout...');
      // Desconecta do Socket.IO
      socketService.disconnect();

      console.log('Removendo token do AsyncStorage...');
      await AsyncStorage.multiRemove(['@brecho:token', '@brecho:user', '@brecho:refreshToken']);
      
      console.log('Removendo token dos headers da API...');
      delete api.defaults.headers.authorization;
      setData({} as AuthState);
      
      console.log('Logout completo');
    } catch (error) {
      console.error('Erro ao fazer logout:', error);
    }
  };

  const refreshSession = async () => {
    try {
      const refreshToken = await AsyncStorage.getItem('@brecho:refreshToken');
      const response = await api.post('/auth/refresh-token', {
        refreshToken,
      });

      const { token, newRefreshToken } = response.data;

      await AsyncStorage.setItem('@brecho:token', token);
      await AsyncStorage.setItem('@brecho:refreshToken', newRefreshToken);

      api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    } catch (error) {
      await signOut();
    }
  };

  return (
    <AuthContext.Provider 
      value={{ 
        signed: !!data.user, 
        user: data.user, 
        loading, 
        signIn, 
        signUp,
        signOut,
        refreshSession,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextData {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }

  return context;
} 