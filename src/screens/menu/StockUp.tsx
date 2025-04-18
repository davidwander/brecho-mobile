import BackButton from '@components/BackButton';
import { Center, Text } from '@gluestack-ui/themed';

export function StockUp() {
  return (
    <Center flex={1} bg="$backgroundDark950">
      <BackButton />
      <Text size="2xl" color="$textLight0">
        Tela de Estoque
      </Text>
    </Center>
  );
}