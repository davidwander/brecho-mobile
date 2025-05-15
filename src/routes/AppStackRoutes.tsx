import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { AppRoutes } from './app.routes';
import { StockUp } from '@screens/menu/StockUp';
import { Exits } from '@screens/menu/Exits';
import { OpenSales } from '@screens/menu/OpenSales';
import { NavigatorScreenParams } from '@react-navigation/native';

export type AppRoutes = {
  home: undefined;
  newRegister: undefined;
  shipments: undefined;
  profile: undefined;
}

export type RootStackParamList = {
  tabs: NavigatorScreenParams<AppRoutes>;
  stockUp: { saleId?: string };
  exits: undefined;
  openSales: undefined;
};

const Stack = createNativeStackNavigator<RootStackParamList>();

export function AppStackRoutes() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="tabs" component={AppRoutes} />
      <Stack.Screen name="stockUp" component={StockUp} />
      <Stack.Screen name="exits" component={Exits} />
      <Stack.Screen name="openSales" component={OpenSales} />
    </Stack.Navigator>
  );
}
