import { io, Socket } from 'socket.io-client';
import { API_URL } from '../config/env';
import AsyncStorage from '@react-native-async-storage/async-storage';

class SocketService {
  private socket: Socket | null = null;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;

  async connect() {
    try {
      if (this.socket?.connected) return;

      const token = await AsyncStorage.getItem('@brecho:token');
      
      if (!token) {
        console.warn('Tentativa de conexão socket sem token');
        return;
      }

      console.log('Tentando conectar ao Socket.IO:', API_URL);
      
      this.socket = io(API_URL, {
        auth: {
          token
        },
        transports: ['websocket'],
        reconnection: true,
        reconnectionAttempts: this.maxReconnectAttempts,
        reconnectionDelay: 1000,
        timeout: 10000
      });

      this.setupEventListeners();
    } catch (error) {
      console.error('Erro ao inicializar socket:', error);
    }
  }

  private setupEventListeners() {
    if (!this.socket) return;

    this.socket.on('connect', () => {
      console.log('Conectado ao servidor Socket.IO');
      this.reconnectAttempts = 0;
    });

    this.socket.on('disconnect', (reason) => {
      console.log('Desconectado do servidor Socket.IO:', reason);
    });

    this.socket.on('error', (error) => {
      console.error('Erro na conexão Socket.IO:', error);
      this.handleReconnect();
    });

    this.socket.on('connect_error', (error) => {
      console.error('Erro ao conectar Socket.IO:', error);
      this.handleReconnect();
    });
  }

  private handleReconnect() {
    if (this.reconnectAttempts < this.maxReconnectAttempts) {
      this.reconnectAttempts++;
      console.log(`Tentativa de reconexão ${this.reconnectAttempts}/${this.maxReconnectAttempts}`);
      setTimeout(() => {
        if (!this.socket?.connected) {
          this.connect();
        }
      }, 5000);
    } else {
      console.error('Número máximo de tentativas de reconexão atingido');
    }
  }

  // Método para ouvir eventos específicos
  on(event: string, callback: (data: any) => void) {
    if (!this.socket) {
      this.connect().then(() => {
        this.socket?.on(event, callback);
      });
    } else {
      this.socket.on(event, callback);
    }
  }

  // Método para parar de ouvir eventos específicos
  off(event: string) {
    this.socket?.off(event);
  }

  // Método para emitir eventos
  emit(event: string, data: any, callback?: (error?: any, response?: any) => void) {
    if (!this.socket?.connected) {
      console.warn('Socket não está conectado. Tentando reconectar...');
      this.connect().then(() => {
        if (this.socket?.connected) {
          this.emitWithTimeout(event, data, callback);
        } else {
          callback?.(new Error('Não foi possível conectar ao servidor'));
        }
      });
    } else {
      this.emitWithTimeout(event, data, callback);
    }
  }

  private emitWithTimeout(event: string, data: any, callback?: (error?: any, response?: any) => void) {
    const timeout = setTimeout(() => {
      callback?.(new Error('Timeout ao emitir evento'));
    }, 10000);

    this.socket?.emit(event, data, (error: any, response: any) => {
      clearTimeout(timeout);
      if (error) {
        console.error(`Erro ao emitir evento ${event}:`, error);
        callback?.(error);
      } else {
        callback?.(undefined, response);
      }
    });
  }

  // Método para desconectar
  disconnect() {
    if (this.socket?.connected) {
      this.socket.disconnect();
      this.socket = null;
      this.reconnectAttempts = 0;
    }
  }

  // Método para verificar o status da conexão
  isConnected() {
    return this.socket?.connected || false;
  }

  // Método para reconectar
  reconnect() {
    this.disconnect();
    return this.connect();
  }
}

export const socketService = new SocketService(); 