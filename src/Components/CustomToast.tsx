import { Toast, Text } from '@gluestack-ui/themed';
import { View } from 'react-native';

type CustomToastProps = {
  message: string;
  type: 'success' | 'error';
};

export function CustomToast({ message, type }: CustomToastProps) {
  return (
    <Toast
      nativeID={`toast-${type}`}
      action={type}
      variant="solid"
      bg={type === 'success' ? '$green600' : '$red600'}
      borderRadius="$md"
      padding="$3"
    >
      <Text color="$white" fontSize="$sm" fontWeight="$medium">
        {message}
      </Text>
    </Toast>
  );
}