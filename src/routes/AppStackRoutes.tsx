import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { AppRoutes } from './app.routes';
import { StockUp } from '@screens/menu/StockUp';
import { Exits } from '@screens/menu/Exits';
import { Calendar } from '@screens/menu/Calendar';
import { NavigatorScreenParams } from '@react-navigation/native';

export type AppRoutes = {
  home: undefined;
  newRegister: undefined;
  shipments: undefined;
  profile: undefined;
}

export type RootStackParamList = {
  tabs: NavigatorScreenParams<AppRoutes>;
  stockUp: undefined;
  exits: undefined;
  calendar: undefined;
};

const Stack = createNativeStackNavigator<RootStackParamList>();

export function AppStackRoutes() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="tabs" component={AppRoutes} />
      <Stack.Screen name="stockUp" component={StockUp} />
      <Stack.Screen name="exits" component={Exits} />
      <Stack.Screen name="calendar" component={Calendar} />
    </Stack.Navigator>
  );
}
