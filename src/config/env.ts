import { Platform } from 'react-native';

// Para emulador Android, use 10.0.2.2
// Para dispositivo físico Android, use o IP da máquina
// Para iOS, use o IP da máquina
const API_HOST = Platform.select({
  android: Platform.OS === 'android' && __DEV__ ? '10.0.2.2' : '192.168.3.7',
  ios: '192.168.3.7',
  default: '192.168.3.7',
});

export const API_URL = `http://${API_HOST}:3333`;

// Log da configuração
console.log('Configuração de API:', {
  platform: Platform.OS,
  isDev: __DEV__,
  apiUrl: API_URL
}); 