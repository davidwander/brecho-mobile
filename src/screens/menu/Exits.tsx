import { useForm, Controller } from 'react-hook-form';
import { ScrollView } from 'react-native';
import { VStack, Text, Center, Box } from '@gluestack-ui/themed';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';

import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '@routes/AppStackRoutes';

import BackButton from '@components/BackButton';
import { Input } from '@components/Input';
import { Button } from '@components/Button';

type FormDataProps = {
  nameClient: string;
  cpf: string;
  address: string;
};

const exitsSchema = yup.object({
  nameClient: yup.string().required("Informe o nome do(a) cliente"),
  cpf: yup.string().required("Informe o CPF").min(11, "CFP invalido!"),
  address: yup.string().required("Informe o endereço")
})

export function Exits() {
  const { control, handleSubmit, formState: { errors } } = useForm<FormDataProps>
  ({
    resolver: yupResolver(exitsSchema)
  });

  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();

  const handleFormSubmit = (data: FormDataProps) => {
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
            name="nameClient"
            control={control}
            render={({ field: { onChange, value } }) => {
              return (
                <Input 
                  placeholder="Nome do(a) Cliente" 
                  autoCapitalize="none"
                  value={value} 
                  onChangeText=  {onChange} 
                  errorMessage={errors.nameClient?.message}
                />
              )
            }}
          />
          <Controller
            name="cpf"
            control={control}
            render={({ field: { onChange, value } }) => {
              return (
                <Input 
                  placeholder="CPF" 
                  keyboardType="numeric" 
                  value={value} 
                  onChangeText={onChange} 
                  errorMessage={errors.cpf?.message}
                />
              )
            }}
          />
          <Controller
            name="address"
            control={control}
            render={({ field: { onChange, value } }) => {
              return (
                <Input 
                  placeholder="Endereço" 
                  autoCapitalize="none"
                  value={value} 
                  onChangeText={onChange} 
                  errorMessage={errors.address?.message}
                />
              )
            }}
          />

          <Center mt="$4">
            <Button
              title="Adicionar peças"
              variant="solid"
              onPress={handleSubmit(handleFormSubmit)}
            />
          </Center>
        </VStack>
      </ScrollView>
    </Box>
  );
}
