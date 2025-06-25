import { NavigationContainer, DefaultTheme } from '@react-navigation/native';
import { Box } from '@gluestack-ui/themed';
import { useAuth } from '../contexts/AuthContext';

import { AppStackRoutes } from './AppStackRoutes';
import { AuthRoutes } from './auth.routes';
import { Loading } from '../components/Loading';

export function Routes() {
  const { signed, loading } = useAuth();
  
  const theme = DefaultTheme;
  theme.colors.background = '#262626'; // textDark800

  if (loading) {
    return <Loading />;
  }

  console.log('Estado de autenticação:', { signed, loading });

  return (
    <Box flex={1} bg="$textDark800">
      <NavigationContainer theme={theme}>
        {signed ? <AppStackRoutes /> : <AuthRoutes />}
      </NavigationContainer>
    </Box>
  );
}
