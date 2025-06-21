import { io } from 'socket.io-client';
import { API_URL } from '../config/env';

export const socket = io(API_URL, {
  autoConnect: false,
  reconnection: true,
  reconnectionAttempts: 5
});

export const connectSocket = () => {
  if (!socket.connected) {
    socket.connect();
  }
};

export const disconnectSocket = () => {
  if (socket.connected) {
    socket.disconnect();
  }
};

// Produtos
export const createProduct = (product: any) => {
  socket.emit('product:create', product);
};

export const updateProduct = (product: any) => {
  socket.emit('product:update', product);
};

// Vendas
export const createSale = (sale: any) => {
  socket.emit('sale:create', sale);
};

export const updateSaleStatus = (id: string, status: string) => {
  socket.emit('sale:update_status', { id, status });
};

// Entregas
export const createDelivery = (delivery: any) => {
  socket.emit('delivery:create', delivery);
};

export const updateDeliveryStatus = (id: string, status: string) => {
  socket.emit('delivery:update_status', { id, status });
}; 