import { StatusBar } from 'react-native';
import { 
  useFonts,
  Roboto_700Bold,
  Roboto_400Regular,
} from '@expo-google-fonts/roboto';
import { GluestackUIProvider } from '@gluestack-ui/themed';

import { config } from './config/gluestack-ui.config';

import { Routes } from './src/routes';
import { Loading } from './src/components/Loading';
import { ProductProvider } from '@contexts/ProductContext';
//import { SignIn } from './src/screens/SignIn';
//import { SignUp } from './src/screens/SignUp';

export default function App() {
  const [fontsLoaded] = useFonts ({ Roboto_700Bold, Roboto_400Regular });

  return (
    <GluestackUIProvider config={config}>
      <ProductProvider>
        <StatusBar 
          barStyle="light-content" 
          backgroundColor="transparent" 
          translucent
        />

        {fontsLoaded ? <Routes /> : <Loading /> }
      </ProductProvider>
    </GluestackUIProvider>
  );
}

