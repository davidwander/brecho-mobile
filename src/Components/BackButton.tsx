import React from 'react';
import { ViewStyle } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Pressable, Icon } from '@gluestack-ui/themed';
import { ChartNoAxesGantt } from 'lucide-react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../routes/AppStackRoutes'; 

interface BackButtonProps {
  style?: ViewStyle;
  iconColor?: string;
  iconSize?: number;
}

const BackButton: React.FC<BackButtonProps> = ({
  style,
  iconColor = "white"
}) => {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();

  const handleGoHome = () => {
    navigation.navigate("tabs", {
      screen: "home", 
    });
  };

  return (
    <Pressable
      position="absolute"
      top="$14"
      left="$4"
      zIndex={100}
      bgColor="$trueGray600" 
      borderRadius="$full" 
      p="$3" 
      style={style} 
      $pressed={{
        bgColor: "$trueGray500", 
        transform: [{ scale: 0.95 }], 
      }}
      onPress={handleGoHome}
    >
      <Icon as={ChartNoAxesGantt} size="xl" color={iconColor} />
    </Pressable>
  );
};

export default BackButton;
