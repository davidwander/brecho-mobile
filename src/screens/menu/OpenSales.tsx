import BackButton from '@components/BackButton';
import { Center, Text } from '@gluestack-ui/themed';

export function OpenSales() {
  return (
    <Center flex={1} bg="$backgroundDark950">
      <BackButton />
      <Text size="2xl" color="$textLight0">
        Tela de vendas em aberto
      </Text>
    </Center>
  );
}