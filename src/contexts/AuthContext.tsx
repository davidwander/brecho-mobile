import React, { createContext, useContext, useState, useEffect, PropsWithChildren } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { api } from '../services/api';
import { socketService } from '../services/socketService';
import { Alert } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { AuthNavigatorRoutesProps } from '../routes/auth.routes';

interface User {
  id: string;
  name: string;
  email: string;
}

interface AuthState {
  accessToken: string;
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

export const AuthProvider: React.FC<PropsWithChildren> = ({ children }) => {
  const [data, setData] = useState<AuthState | null>(null);
  const [loading, setLoading] = useState(true);
  const navigation = useNavigation<AuthNavigatorRoutesProps>();

  // Configurar interceptor global para erros de autenticação
  useEffect(() => {
    const interceptor = api.interceptors.response.use(
      response => response,
      async (error) => {
        if (error.response?.status === 401) {
          try {
            // Tenta fazer o refresh do token
            const newTokens = await refreshSession();
            if (newTokens) {
              // Refaz a requisição original com o novo token
              const originalRequest = error.config;
              originalRequest.headers.Authorization = `Bearer ${newTokens.accessToken}`;
              return api(originalRequest);
            }
          } catch (refreshError) {
            console.error('Erro no refresh do token:', refreshError);
            await signOut();
            return Promise.reject(error);
          }
        }
        return Promise.reject(error);
      }
    );

    return () => {
      api.interceptors.response.eject(interceptor);
    };
  }, []);

  useEffect(() => {
    async function loadStorageData(): Promise<void> {
      try {
        const [token, user, refreshToken] = await AsyncStorage.multiGet([
          '@brecho:token',
          '@brecho:user',
          '@brecho:refreshToken'
        ]);

        if (token[1] && user[1] && refreshToken[1]) {
          api.defaults.headers.Authorization = token[1];
          
          try {
            await api.get('/auth/validate');
            
            const userData = JSON.parse(user[1]);
            const storedToken = token[1].replace('Bearer ', '');
            
            setData({ 
              accessToken: storedToken,
              user: userData,
              refreshToken: refreshToken[1]
            });

            await socketService.connect();
          } catch (error: any) {
            if (error.response?.status === 401) {
              await refreshSession();
            } else {
              throw error;
            }
          }
        }
      } catch (error) {
        console.error('Erro ao carregar dados do storage:', error);
        await signOut();
      } finally {
        setLoading(false);
      }
    }

    loadStorageData();
  }, []);

  const signIn = async ({ email, password }: SignInCredentials) => {
    try {
      const response = await api.post('/auth/login', {
        email,
        password,
      });

      const { accessToken, user: userData, refreshToken } = response.data;

      await AsyncStorage.multiSet([
        ['@brecho:token', `Bearer ${accessToken}`],
        ['@brecho:user', JSON.stringify(userData)],
        ['@brecho:refreshToken', refreshToken],
      ]);

      api.defaults.headers.Authorization = `Bearer ${accessToken}`;
      setData({ accessToken, user: userData, refreshToken });

      await socketService.connect();
    } catch (error: any) {
      console.error('Erro no login:', error);
      throw new Error(error.response?.data?.message || 'Erro ao fazer login');
    }
  };

  const signUp = async ({ name, email, password }: SignUpCredentials) => {
    try {
      if (!name?.trim()) throw new Error('Nome é obrigatório');
      if (!email?.trim()) throw new Error('Email é obrigatório');
      if (!password?.trim()) throw new Error('Senha é obrigatória');
      if (password.length < 6) throw new Error('A senha deve ter no mínimo 6 caracteres');

      const formattedData = {
        name: name.trim(),
        email: email.trim().toLowerCase(),
        password: password
      };

      const response = await api.post('/auth/register', formattedData);

      if (!response.data.accessToken || !response.data.user) {
        throw new Error('Resposta inválida do servidor: token ou dados do usuário ausentes');
      }

      await AsyncStorage.multiSet([
        ['@brecho:token', `Bearer ${response.data.accessToken}`],
        ['@brecho:user', JSON.stringify(response.data.user)]
      ]);

      api.defaults.headers.Authorization = `Bearer ${response.data.accessToken}`;
      setData({ accessToken: response.data.accessToken, user: response.data.user });
    } catch (error: any) {
      if (error.response?.status === 409 || 
          error.response?.data?.error?.includes('já cadastrado') || 
          error.response?.data?.error?.includes('already exists')) {
        throw new Error('Este email já está em uso');
      }
      throw new Error(error.response?.data?.message || 'Erro ao fazer registro');
    }
  };

  const signOut = async () => {
    try {
      await socketService.disconnect();
      await AsyncStorage.multiRemove(['@brecho:token', '@brecho:user', '@brecho:refreshToken']);
      delete api.defaults.headers.Authorization;
      setData(null);
    } catch (error) {
      console.error('Erro ao fazer logout:', error);
    }
  };

  const refreshSession = async () => {
    try {
      const storedRefreshToken = await AsyncStorage.getItem('@brecho:refreshToken');
      
      if (!storedRefreshToken) {
        throw new Error('REFRESH_TOKEN_NOT_FOUND');
      }

      const response = await api.post('/auth/refresh-token', {
        refreshToken: storedRefreshToken,
      });

      const { accessToken: newAccessToken, refreshToken: newRefreshToken } = response.data;

      await AsyncStorage.multiSet([
        ['@brecho:token', `Bearer ${newAccessToken}`],
        ['@brecho:refreshToken', newRefreshToken]
      ]);

      api.defaults.headers.Authorization = `Bearer ${newAccessToken}`;
      
      if (data?.user) {
        const newData = {
          ...data,
          accessToken: newAccessToken,
          refreshToken: newRefreshToken
        };
        setData(newData);
      }

      return { accessToken: newAccessToken, refreshToken: newRefreshToken };
    } catch (error) {
      console.error('Erro no refresh do token:', error);
      await signOut();
      throw error;
    }
  };

  return (
    <AuthContext.Provider 
      value={{ 
        signed: !!data?.accessToken && !!data?.user, 
        user: data?.user || null, 
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
};

export function useAuth(): AuthContextData {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }

  return context;
} 