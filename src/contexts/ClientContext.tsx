import React, { createContext, useContext, useState, ReactNode } from 'react';
import { ClientData } from '../types/SaleTypes';

export interface SavedClient extends ClientData {
  id: string;
  createdAt: string;
  updatedAt: string;
}

export type ClientContextType = {
  savedClients: SavedClient[];
  addClient: (client: ClientData) => string;
  updateClient: (id: string, client: ClientData) => void;
  updateClientByCpf: (cpf: string, client: ClientData) => void;
  deleteClient: (id: string) => void;
  getClientById: (id: string) => SavedClient | undefined;
  getClientByCpf: (cpf: string) => SavedClient | undefined;
  searchClients: (query: string) => SavedClient[];
};

const ClientContext = createContext<ClientContextType | undefined>(undefined);

type Props = {
  children: ReactNode;
};

export const ClientProvider = ({ children }: Props) => {
  const [savedClients, setSavedClients] = useState<SavedClient[]>([]);

  const addClient = (client: ClientData): string => {
    const newClient: SavedClient = {
      ...client,
      id: Date.now().toString(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    setSavedClients(prev => [...prev, newClient]);
    return newClient.id;
  };

  const updateClient = (id: string, client: ClientData) => {
    setSavedClients(prev =>
      prev.map(savedClient =>
        savedClient.id === id
          ? {
              ...savedClient,
              ...client,
              updatedAt: new Date().toISOString(),
            }
          : savedClient
      )
    );
  };

  const updateClientByCpf = (cpf: string, client: ClientData) => {
    setSavedClients(prev =>
      prev.map(savedClient =>
        savedClient.cpf === cpf
          ? {
              ...savedClient,
              ...client,
              updatedAt: new Date().toISOString(),
            }
          : savedClient
      )
    );
  };

  const deleteClient = (id: string) => {
    setSavedClients(prev => prev.filter(client => client.id !== id));
  };

  const getClientById = (id: string): SavedClient | undefined => {
    return savedClients.find(client => client.id === id);
  };

  const getClientByCpf = (cpf: string): SavedClient | undefined => {
    return savedClients.find(client => client.cpf === cpf);
  };

  const searchClients = (query: string): SavedClient[] => {
    const lowerQuery = query.toLowerCase();
    return savedClients.filter(client =>
      client.nameClient.toLowerCase().includes(lowerQuery) ||
      client.cpf.includes(query) ||
      client.phone.includes(query)
    );
  };

  return (
    <ClientContext.Provider
      value={{
        savedClients,
        addClient,
        updateClient,
        updateClientByCpf,
        deleteClient,
        getClientById,
        getClientByCpf,
        searchClients,
      }}
    >
      {children}
    </ClientContext.Provider>
  );
};

export const useClient = () => {
  const context = useContext(ClientContext);
  if (context === undefined) {
    throw new Error('useClient deve ser usado dentro de um ClientProvider');
  }
  return context;
}; 