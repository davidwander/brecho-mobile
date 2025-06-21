import { io, Socket } from 'socket.io-client';
import { API_URL } from '../config/env';
import AsyncStorage from '@react-native-async-storage/async-storage';

class SocketService {
  private socket: Socket | null = null;

  async connect() {
    if (this.socket?.connected) return;

    const token = await AsyncStorage.getItem('@brecho:token');
    
    this.socket = io(API_URL, {
      auth: {
        token
      },
      transports: ['websocket'],
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000
    });

    this.setupEventListeners();
  }

  private setupEventListeners() {
    if (!this.socket) return;

    this.socket.on('connect', () => {
      console.log('Conectado ao servidor Socket.IO');
    });

    this.socket.on('disconnect', () => {
      console.log('Desconectado do servidor Socket.IO');
    });

    this.socket.on('error', (error) => {
      console.error('Erro na conexão Socket.IO:', error);
      // Tentar reconectar em caso de erro
      setTimeout(() => {
        if (!this.socket?.connected) {
          this.connect();
        }
      }, 5000);
    });

    this.socket.on('connect_error', (error) => {
      console.error('Erro ao conectar Socket.IO:', error);
    });
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
  emit(event: string, data: any) {
    if (!this.socket?.connected) {
      console.warn('Socket não está conectado. Tentando reconectar...');
      this.connect().then(() => {
        this.socket?.emit(event, data);
      });
    } else {
      this.socket.emit(event, data, (error: any) => {
        if (error) {
          console.error(`Erro ao emitir evento ${event}:`, error);
        }
      });
    }
  }

  // Método para desconectar
  disconnect() {
    if (this.socket?.connected) {
      this.socket.disconnect();
      this.socket = null;
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