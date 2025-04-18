import { useRef } from 'react';
import { useNavigation } from '@react-navigation/native';
import {
  Actionsheet,
  ActionsheetBackdrop,
  ActionsheetContent,
  ActionsheetItem,
  HStack,
  Box,
} from '@gluestack-ui/themed';
import { ClipboardList, DollarSign, Calendar } from 'lucide-react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '@routes/AppStackRoutes';
import { Animated, Pressable } from 'react-native'


interface ActionSheetMenuProps {
  isOpen: boolean;
  onClose: () => void;
  sheetReady: boolean;
}

export function ActionSheetMenu({ isOpen, onClose, sheetReady }: ActionSheetMenuProps) {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();

  const icons = [
    { icon: ClipboardList, route: 'stockUp' },
    { icon: DollarSign, route: 'exits' },
    { icon: Calendar, route: 'calendar' },
  ];

  return (
    <Actionsheet isOpen={isOpen} onClose={onClose}>
      <ActionsheetBackdrop />
      {sheetReady && (
        <ActionsheetContent
          bg="$trueGray600"
          rounded="$2xl"
          p="$8"
          minHeight={150}
        >
          <HStack
            flexWrap="wrap"
            justifyContent="space-evenly"
            alignItems="center"
            gap="$2"
            opacity={sheetReady ? 1 : 0}
            pointerEvents={sheetReady ? 'auto' : 'none'}
          >
            {icons.map(({ icon: Icon, route }, index) => {
              const scale = useRef(new Animated.Value(1)).current;

              const onPressIn = () => {
                Animated.spring(scale, {
                  toValue: 0.95,
                  useNativeDriver: true,
                }).start();
              };

              const onPressOut = () => {
                Animated.spring(scale, {
                  toValue: 1,
                  friction: 3, 
                  tension: 40,
                  useNativeDriver: true,
                }).start();
              };
              return (
                <ActionsheetItem
                  key={index}
                  w={80}
                  h={80}
                  p="$2"
                  justifyContent="center"
                  bg="transparent"
                  $pressed={{
                    bg: "$trueGray300",
                    rounded: "$xl"
                  }}
                  $hover={{
                    bg: "$trueGray00"
                  }}
                >
                  <Pressable 
                    onPressIn={onPressIn} 
                    onPressOut={onPressOut}
                    onPress={() => {
                      onClose();
                      navigation.navigate(route as "calendar" | "stockUp" | "exits");
                    }}
                  >
                    <Animated.View
                      style={{
                        transform: [{ scale }],
                        width: 80,
                        height: 80,
                        backgroundColor: '#9647d6', 
                        borderRadius: 20,
                        alignItems: 'center',
                        justifyContent: 'center',
                        shadowColor: '#000',
                        shadowOffset: { width: 0, height: 4 },
                        shadowOpacity: 0.3,
                        shadowRadius: 5,
                        elevation: 6,
                      }}
                    >
                      <Icon color="#fff" size={36} />
                    </Animated.View>
                  </Pressable>
                </ActionsheetItem>
              );
            })}
          </HStack>
        </ActionsheetContent>
      )}
    </Actionsheet>
  );
}
