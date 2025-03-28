import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';

import { Home } from '@screens/Home';
import { Sales } from '@screens/Sales';
import { Calendar } from '@screens/Calendar';
import { Shipments } from '@screens/shipments';
import { Profile } from '@screens/Profile';

const { Navigator, Screen } = createBottomTabNavigator();

export function AppRoutes() {
  return (
    <Navigator>
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