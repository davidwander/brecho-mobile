import { Platform } from 'react-native';

// Configuração do host da API
const getApiHost = () => {
  const isEmulator = Platform.OS === 'android' && __DEV__;
  const defaultHost = '192.168.3.7'; // Seu IP local

  if (isEmulator) {
    return '10.0.2.2'; // Host especial para emulador Android
  }

  return defaultHost;
};

const API_HOST = getApiHost();
export const API_URL = `http://${API_HOST}:3333`;

// Log detalhado da configuração
console.log('Configuração detalhada da API:', {
  platform: Platform.OS,
  isDev: __DEV__,
  isEmulator: Platform.OS === 'android' && __DEV__,
  apiHost: API_HOST,
  apiUrl: API_URL,
  deviceInfo: {
    brand: Platform.select({ android: Platform.constants?.Brand, ios: 'Apple', default: 'unknown' }),
    version: Platform.Version,
  }
});

// Função para testar a conexão com a API
export const testApiConnection = async () => {
  try {
    const response = await fetch(API_URL);
    console.log('Teste de conexão com a API:', {
      status: response.status,
      ok: response.ok,
      statusText: response.statusText
    });
    return response.ok;
  } catch (error) {
    console.error('Erro ao testar conexão com a API:', {
      message: error.message,
      apiUrl: API_URL
    });
    return false;
  }
}; 