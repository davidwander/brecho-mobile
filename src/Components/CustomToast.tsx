import React from 'react';
import { useToast, Box, Text, HStack } from '@gluestack-ui/themed';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { TouchableOpacity } from 'react-native';

interface CustomToastProps {
  message: string;
  type: 'success' | 'error';
  duration?: number;
  placement?: 'top' | 'bottom' | 'center';
  accessibilityLabel?: string;
}

export const CustomToast: React.FC<CustomToastProps> = ({
  message,
  type,
  duration = 10000,
  placement = 'top',
  accessibilityLabel = `Fechar mensagem de ${type === 'success' ? 'sucesso' : 'erro'}`,
}) => {
  const toast = useToast();

  const showToast = () => {
    toast.show({
      duration,
      containerStyle: {
        zIndex: 999999,
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        alignItems: 'center',
      },
      render: () => (
        <Box
          bg={type === 'success' ? '$green600' : '$red600'}
          borderRadius="$lg"
          px="$5"
          py="$4"
          borderWidth={2}
          borderColor={type === 'success' ? '$green500' : '$red500'}
          softShadow="2"
          maxWidth="$5/6"
          mx="$2"
          zIndex={999999}
          position="absolute"
          top="$4"
          role="alert"
          aria-live="polite"
          $base-animation={{
            initial: { opacity: 0, translateY: -20 },
            animate: { opacity: 1, translateY: 0 },
            exit: { opacity: 0, translateY: -20 },
            transition: { duration: 300, easing: 'ease-in-out' },
          }}
        >
          <HStack alignItems="center" space="md">
            <Ionicons
              name={type === 'success' ? 'checkmark-circle-outline' : 'alert-circle-outline'}
              size={24}
              color="$white"
            />
            <Text
              color="$white"
              fontSize="$lg"
              fontWeight="$medium"
              fontFamily="$body"
              lineHeight="$lg"
              flex={1}
              numberOfLines={2}
              ellipsizeMode="tail"
            >
              {message}
            </Text>
            <TouchableOpacity
              onPress={() => toast.closeAll()}
              accessibilityLabel={accessibilityLabel}
            >
              <Ionicons name="close-outline" size={20} color="$white" />
            </TouchableOpacity>
          </HStack>
        </Box>
      ),
    });
  };

  React.useEffect(() => {
    showToast();
  }, [message, type, duration, placement]);

  return null;
};