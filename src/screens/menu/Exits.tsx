import { useForm, Controller } from 'react-hook-form';
import { ScrollView } from 'react-native';
import { VStack, Text, Center, Box } from '@gluestack-ui/themed';

import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '@routes/AppStackRoutes';

import BackButton from '@components/BackButton';
import { Input } from '@components/Input';
import { Button } from '@components/Button';

type ClientFormData = {
  name: string;
  cpf: string;
  address: string;
};

export function Exits() {
  const { control, handleSubmit } = useForm<ClientFormData>({
    defaultValues: {
      name: '',
      cpf: '',
      address: '',
    },
  });

  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();

  const onSubmit = (data: ClientFormData) => {
    console.log('Dados do cliente:', data);
    navigation.navigate('stockUp');
  };

  return (
    <Box flex={1} bg="$backgroundDark900" px="$4" pt="$16">
      <BackButton />
      <ScrollView contentContainerStyle={{ paddingBottom: 24 }}>
        <Text size="2xl" color="$textLight0" mt="$4" mb="$4" fontFamily="$heading">
          Nova Venda
        </Text>

        <VStack space="md" w="100%">
          <Controller
            control={control}
            name="name"
            render={({ field: { onChange, value } }) => (
              <Input placeholder="Nome do Cliente" value={value} onChangeText={onChange} />
            )}
          />
          <Controller
            control={control}
            name="cpf"
            render={({ field: { onChange, value } }) => (
              <Input placeholder="CPF" keyboardType="numeric" value={value} onChangeText={onChange} />
            )}
          />
          <Controller
            control={control}
            name="address"
            render={({ field: { onChange, value } }) => (
              <Input placeholder="Endereço" value={value} onChangeText={onChange} />
            )}
          />

          <Center mt="$4">
            <Button
              title="Adicionar peças"
              variant="solid"
              onPress={() => navigation.navigate("stockUp")}
            />
          </Center>
        </VStack>
      </ScrollView>
    </Box>
  );
}
