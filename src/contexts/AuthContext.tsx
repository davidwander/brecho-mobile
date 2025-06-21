import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { api } from '../services/api';
import { socketService } from '../services/socketService';

interface User {
  id: string;
  name: string;
  email: string;
}

interface AuthState {
  token: string;
  user: User;
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
  user: User;
  loading: boolean;
  signIn(credentials: SignInCredentials): Promise<void>;
  signUp(credentials: SignUpCredentials): Promise<void>;
  signOut(): void;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextData>({} as AuthContextData);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [data, setData] = useState<AuthState>({} as AuthState);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadStorageData(): Promise<void> {
      const [token, user] = await AsyncStorage.multiGet([
        '@brecho:token',
        '@brecho:user',
      ]);

      if (token[1] && user[1]) {
        try {
          // Adiciona o token no header das requisições
          api.defaults.headers.authorization = `Bearer ${token[1]}`;
          
          // Faz uma requisição para verificar se o token ainda é válido
          await api.get('/auth/validate');
          
          const userData = JSON.parse(user[1]);
          setData({ token: token[1], user: userData });

          // Conecta ao Socket.IO após validar o token
          await socketService.connect();
        } catch (error) {
          // Se o token não for válido, remove os dados do storage
          await signOut();
        }
      }

      setLoading(false);
    }

    loadStorageData();

    // Desconecta o Socket.IO quando o componente for desmontado
    return () => {
      socketService.disconnect();
    };
  }, []);

  const signIn = async ({ email, password }: SignInCredentials) => {
    try {
      const response = await api.post('/auth/login', {
        email,
        password,
      });

      const { token, user } = response.data;

      await AsyncStorage.multiSet([
        ['@brecho:token', token],
        ['@brecho:user', JSON.stringify(user)],
      ]);

      api.defaults.headers.authorization = `Bearer ${token}`;
      setData({ token, user });

      // Conecta ao Socket.IO após o login
      await socketService.connect();
    } catch (error) {
      throw new Error('Erro ao fazer login');
    }
  };

  const signUp = async ({ name, email, password }: SignUpCredentials) => {
    try {
      const response = await api.post('/auth/register', {
        name,
        email,
        password,
      });

      const { token, user } = response.data;

      await AsyncStorage.multiSet([
        ['@brecho:token', token],
        ['@brecho:user', JSON.stringify(user)],
      ]);

      api.defaults.headers.authorization = `Bearer ${token}`;
      setData({ token, user });

      // Conecta ao Socket.IO após o registro
      await socketService.connect();
    } catch (error) {
      throw new Error('Erro ao criar conta');
    }
  };

  const signOut = async () => {
    // Desconecta do Socket.IO
    socketService.disconnect();

    await AsyncStorage.multiRemove(['@brecho:token', '@brecho:user']);
    api.defaults.headers.authorization = undefined;
    setData({} as AuthState);
  };

  return (
    <AuthContext.Provider 
      value={{ 
        user: data.user, 
        loading, 
        signIn, 
        signUp,
        signOut,
        isAuthenticated: !!data.token
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