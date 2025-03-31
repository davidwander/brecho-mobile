import { 
  createBottomTabNavigator, 
  BottomTabNavigationProp 
} from '@react-navigation/bottom-tabs';
import { Platform } from 'react-native';
import { gluestackUIConfig } from '../../config/gluestack-ui.config';

import { Home } from '@screens/Home';
import { RegisterNew } from '@screens/RegisterNew';
import { Shipments } from '@screens/shipments';
import { Profile } from '@screens/Profile';

import { 
  Home as HomeIcon,
  BadgePlus,
  Truck,
  User,
} from 'lucide-react-native';

type AppRoutes = {
  home: undefined,
  registerNew: undefined,
  shipments: undefined,
  profile: undefined,
}

export type AppNavigatorRoutesProps = BottomTabNavigationProp<AppRoutes>;

const { Navigator, Screen } = createBottomTabNavigator<AppRoutes>();

export function AppRoutes() {
  const { tokens } = gluestackUIConfig
  const iconSize = tokens.space["8"]

  return (
    <Navigator screenOptions={{ 
      headerShown: false,
      tabBarShowLabel: false, 
      tabBarActiveTintColor: tokens.colors.purple500,
      tabBarInactiveTintColor: tokens.colors.purple300,
      tabBarStyle: {
        backgroundColor: tokens.colors.trueGray600,
        borderTopWidth: 0,
        height: Platform.OS === "android" ? "auto" : 96,
        paddingBottom: tokens.space["12"],
        paddingTop: tokens.space["4"],
      }
    }}>
      <Screen 
        name="home" 
        component={Home}
        options={{
          tabBarIcon: ({ color }) => (
            <HomeIcon  color={color} width={iconSize} height={iconSize} />
          ),
        }} 
      />

      <Screen 
        name="registerNew" 
        component={RegisterNew} 
        options={{
          tabBarIcon: ({ color }) => (
            <BadgePlus color={color} width={iconSize} height={iconSize} />
          ),
        }}
      />

      <Screen 
        name="shipments" 
        component={Shipments} 
        options={{
          tabBarIcon: ({ color }) => (
            <Truck color={color} width={iconSize} height={iconSize} />
          ),
        }}
      />

      <Screen 
        name="profile" 
        component={Profile} 
        options={{
          tabBarIcon: ({ color }) => (
            <User color={color} width={iconSize} height={iconSize} />
          ),
        }}
      />

    </Navigator>
  )
}