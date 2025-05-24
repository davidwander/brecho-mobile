import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Platform } from 'react-native';
import { gluestackUIConfig } from '../../config/gluestack-ui.config';

import { Home } from '@screens/Home';
import { NewRegister } from '@screens/NewRegister';
import { Shipments } from '@screens/shipments';
import { Profile } from '@screens/Profile';

import Feather from 'react-native-vector-icons/Feather';
import IonIcons from 'react-native-vector-icons/Ionicons';

type AppRoutes = {
  home: undefined;
  newRegister: undefined;
  shipments: undefined;
  profile: undefined;
};

const { Navigator, Screen } = createBottomTabNavigator<AppRoutes>();

export function AppRoutes() {
  const { tokens } = gluestackUIConfig;
  const iconSize = tokens.space["8"];

  return (
    <Navigator
      screenOptions={{
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
        },
      }}
    >
      <Screen
        name="home"
        component={Home}
        options={{
          tabBarIcon: ({ color }) => (
            <Feather 
            name="home" 
            color={color} 
            size={iconSize} 
            style={{ marginTop: -4 }} 
          />
          ),
        }}
      />
      <Screen
        name="newRegister"
        component={NewRegister}
        options={{
          tabBarIcon: ({ color }) => (
            <Feather 
              name="plus-circle" 
              color={color} 
              size={iconSize} 
              style={{ marginTop: -4 }} 
            />
          ),
        }}
      />
      <Screen
        name="shipments"
        component={Shipments}
        options={{
          tabBarIcon: ({ color }) => (
            <IonIcons 
              name="calendar-outline" 
              color={color} 
              size={iconSize} 
              style={{ marginTop: -4, marginLeft: -2 }} 
            />
          ),
        }}
      />
      <Screen
        name="profile"
        component={Profile}
        options={{
          tabBarIcon: ({ color }) => (
            <Feather 
              name="user" 
              color={color} 
              size={iconSize} 
              style={{ marginTop: -4 }} 
            />
          ),
        }}
      />
    </Navigator>
  );
}
