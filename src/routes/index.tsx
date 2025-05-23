import { NavigationContainer, DefaultTheme } from '@react-navigation/native';
import { Box } from '@gluestack-ui/themed';

import { AppStackRoutes } from './AppStackRoutes';
import { gluestackUIConfig } from '@gluestack-ui/config';

export function Routes() {
  const theme = DefaultTheme;
  theme.colors.background = gluestackUIConfig.tokens.colors.textDark800;

  return (
    <Box flex={1} bg="$textDark800">
      <NavigationContainer theme={theme}>
        <AppStackRoutes />
      </NavigationContainer>
    </Box>
  );
}
