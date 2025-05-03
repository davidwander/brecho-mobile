import React from 'react';
import { ViewStyle } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Pressable, Icon } from '@gluestack-ui/themed';
import Feather from 'react-native-vector-icons/Feather';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../routes/AppStackRoutes'; 

interface BackButtonProps {
  style?: ViewStyle;
  iconColor?: string;
  iconSize?: number;
  absolute?: boolean;
}

const BackButton: React.FC<BackButtonProps> = ({
  style,
  iconColor = "white",
  iconSize = 24,
  absolute = false,
}) => {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();

  const handleGoRegister = () => {
    navigation.navigate("tabs", {
      screen: "newRegister", 
    });
  };

  return (
    <Pressable
      {...(absolute && {
        position: "absolute",
        top: "$12",
        left: "$4",
        zIndex: 100 ,
      })}
      bgColor="$trueGray600" 
      borderRadius="$full" 
      p="$3" 
      alignSelf="flex-start"
      style={style} 
      $pressed={{
        bgColor: "$trueGray500", 
        transform: [{ scale: 0.95 }], 
      }}
      onPress={handleGoRegister}
    >
      <Feather name="arrow-left" size={iconSize} color={iconColor} />
    </Pressable>
  );
};

export default BackButton;
