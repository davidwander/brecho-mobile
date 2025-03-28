import { createBottomTabNavigator, BottomTabNavigationProp } from '@react-navigation/bottom-tabs';

import { Home } from '@screens/Home';
import { Calendar } from '@screens/Calendar';
import { Shipments } from '@screens/shipments';
import { Profile } from '@screens/Profile';

type AppRoutes = {
  home: undefined,
  calendar: undefined,
  shipments: undefined,
  profile: undefined,
}

export type AppNavigatorRoutesProps = BottomTabNavigationProp<AppRoutes>;

const { Navigator, Screen } = createBottomTabNavigator<AppRoutes>();

export function AppRoutes() {
  return (
    <Navigator screenOptions={{ headerShown: false }}>
      <Screen 
        name="home" 
        component={Home} 
      />

      <Screen 
        name="calendar" 
        component={Calendar} 
      />

      <Screen 
        name="shipments" 
        component={Shipments} 
      />

      <Screen 
        name="profile" 
        component={Profile} 
      />

    </Navigator>
  )
}