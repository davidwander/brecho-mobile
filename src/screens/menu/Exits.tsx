import { useState } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { ScrollView, Alert } from 'react-native';
import MaskInput, { Masks } from 'react-native-mask-input';

import { VStack, Text, Center, Box, HStack } from '@gluestack-ui/themed';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';

import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '@routes/AppStackRoutes';

import BackButton from '@components/BackButton';
import { Input } from '@components/Input';
import { Button } from '@components/Button';
import { useSales } from '@contexts/SalesContext';
import { useClient } from '@contexts/ClientContext';
import { ClientData, OpenSale } from '../../types/SaleTypes';

import uuid from 'react-native-uuid';

type FormDataProps = {
  nameClient: string;
  phone: string;
  cpf: string;
  address: string;
};

const exitsSchema = yup.object({
  nameClient: yup
    .string()
    .required("Informe o nome da cliente"),
  phone: yup
    .string()
    .required("Informe o telefone")
    .min(10, "Telefone inválido!")
    .max(11, "Telefone inválido!"),
  cpf: yup
    .string()
    .required("Informe o CPF")
    .min(11, "CPF inválido!")
    .max(11, "CPF inválido!"),
  address: yup
    .string()
    .required("Informe o endereço")
});

export function Exits() {
  const { control, handleSubmit, formState: { errors } } = useForm<FormDataProps>({
    resolver: yupResolver(exitsSchema),
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSavingClient, setIsSavingClient] = useState(false);
  const { setClientData, addOpenSale } = useSales();
  const { addClient, getClientByCpf, updateClientByCpf } = useClient();
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();

  const handleSaveClient = async (data: FormDataProps) => {
    setIsSavingClient(true);
    
    try {
      const existingClient = getClientByCpf(data.cpf);
      
      if (existingClient) {
        Alert.alert(
          "Cliente já cadastrado",
          "Este CPF já está cadastrado no sistema. Deseja atualizar os dados?",
          [
            {
              text: "Cancelar",
              style: "cancel"
            },
            {
              text: "Atualizar",
              onPress: () => {
                const clientData: ClientData = {
                  nameClient: data.nameClient,
                  phone: data.phone,
                  cpf: data.cpf,
                  address: data.address,
                };
                
                updateClientByCpf(data.cpf, clientData);
                Alert.alert("Sucesso", "Cliente atualizado com sucesso!");
              }
            }
          ]
        );
        return;
      }

      const clientData: ClientData = {
        nameClient: data.nameClient,
        phone: data.phone,
        cpf: data.cpf,
        address: data.address,
      };

      const clientId = addClient(clientData);
      
      Alert.alert(
        "Sucesso", 
        "Cliente salva com sucesso!",
        [
          {
            text: "OK",
            onPress: () => console.log("Cliente salva com ID:", clientId)
          }
        ]
      );
    } catch (error) {
      Alert.alert("Erro", "Erro ao salvar cliente. Tente novamente.");
      console.error("Erro ao salvar cliente:", error);
    } finally {
      setIsSavingClient(false);
    }
  };

  const handleFormSubmit = (data: FormDataProps) => {
    console.log("Formulário enviado com dados:", data);
    setIsSubmitting(true);

    setTimeout(() => {
      const saleId = uuid.v4() as string; 

      const ClientData: ClientData = {
        nameClient: data.nameClient,
        phone: data.phone,
        cpf: data.cpf,
        address: data.address,
      };

      const newSale: OpenSale = {
        id: saleId,
        clientData: {
          nameClient: data.nameClient,
          phone: data.phone,
          cpf: data.cpf,
          address: data.address,
        },
        selectedProducts: [], 
        total: 0,
      };

      setClientData(ClientData);
      addOpenSale(newSale); 
      setIsSubmitting(false);
      navigation.navigate("stockUp", { saleId }); 
    }, 800);
  };

  const onError = (error: any) => {
    console.log("Erros de formulário:", errors);
  };

  return (
    <Box flex={1} bg="$backgroundDark900" px="$4" pt="$16">
      <BackButton />
      <ScrollView contentContainerStyle={{ paddingBottom: 24 }}>
        <Text 
          size="2xl" 
          color="$textLight0" 
          mt="$4" 
          mb="$4" 
          fontFamily="$heading"
          alignSelf="center"
        >
          Criar sacola
        </Text>

        <VStack space="md" w="100%">
          <Controller
            name="nameClient"
            control={control}
            render={({ field: { onChange, value } }) => (
              <Input 
                placeholder="Nome da Cliente" 
                autoCapitalize="words"
                value={value} 
                onChangeText={(text) => onChange(text)} 
                errorMessage={errors.nameClient?.message || ""}
              />
            )}
          />

          <Controller
            name="phone"
            control={control}
            render={({ field: { onChange, value } }) => (
              <Input
                value={value}
                mask={Masks.BRL_PHONE}
                onMaskedTextChanged={(masked, unmasked) => {
                  if (unmasked.length <= 11) {
                    onChange(unmasked);
                  }
                }}
                errorMessage={errors.phone?.message || ""}
              />
            )}
          />

          <Controller
            name="cpf"
            control={control}
            render={({ field: { onChange, value } }) => (
              <Input
                value={value}
                mask={Masks.BRL_CPF_CNPJ}
                onMaskedTextChanged={(masked, unmasked) => {
                  if (unmasked.length <= 11) {
                    onChange(unmasked);
                  }
                }}
                errorMessage={errors.cpf?.message || ""}
              />
            )}
          />

          <Controller
            name="address"
            control={control}
            render={({ field: { onChange, value } }) => (
              <Input 
                placeholder="Endereço" 
                autoCapitalize="words"
                multiline
                value={value} 
                onChangeText={(text) => onChange(text)} 
                errorMessage={errors.address?.message || ""}
              />
            )}
          />

          <Center mt="$4">
            <HStack space="md" w="100%">
              <Button
                title="Salvar Cliente"
                variant="outline"
                onPress={handleSubmit(handleSaveClient, onError)}
                isLoading={isSavingClient}
                flex={1}
              />
              <Button
                title="Confirmar"
                variant="solid"
                onPress={handleSubmit(handleFormSubmit, onError)}
                isLoading={isSubmitting}
                flex={1}
              />
            </HStack>
          </Center>
        </VStack>
      </ScrollView>
    </Box>
  );
}
