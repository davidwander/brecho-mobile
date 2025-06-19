import React, { useState } from 'react';
import { FlatList, Alert, TouchableOpacity } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '@routes/AppStackRoutes';

import { Box, Text, VStack, HStack, Icon, Pressable } from '@gluestack-ui/themed';
import { useClient } from '@contexts/ClientContext';
import { useSales } from '@contexts/SalesContext';
import BackButton from '@components/BackButton';
import { Input } from '@components/Input';

import Ionicons from 'react-native-vector-icons/Ionicons';
import Feather from 'react-native-vector-icons/Feather';
import uuid from 'react-native-uuid';

export function Clients() {
  const [searchQuery, setSearchQuery] = useState('');
  const { savedClients, deleteClient, searchClients } = useClient();
  const { setClientData, addOpenSale } = useSales();
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();

  const filteredClients = searchQuery 
    ? searchClients(searchQuery)
    : savedClients;

  const handleDeleteClient = (clientId: string, clientName: string) => {
    Alert.alert(
      "Excluir Cliente",
      `Tem certeza que deseja excluir ${clientName}?`,
      [
        {
          text: "Cancelar",
          style: "cancel"
        },
        {
          text: "Excluir",
          style: "destructive",
          onPress: () => {
            deleteClient(clientId);
            Alert.alert("Sucesso", "Cliente excluída com sucesso!");
          }
        }
      ]
    );
  };

  const handleSelectClient = (client: any) => {
    Alert.alert(
      "Selecionar Cliente",
      `Deseja criar uma nova venda para ${client.nameClient}?`,
      [
        {
          text: "Cancelar",
          style: "cancel"
        },
        {
          text: "Confirmar",
          onPress: () => {
            const saleId = String(uuid.v4());
            const newSale = {
              id: saleId,
              clientData: {
                nameClient: client.nameClient,
                phone: client.phone,
                cpf: client.cpf,
                address: client.address,
              },
              selectedProducts: [],
              total: 0,
            };

            setClientData(newSale.clientData);
            addOpenSale(newSale);
            navigation.navigate("stockUp", { saleId });
          }
        }
      ]
    );
  };

  const renderClientItem = ({ item }: { item: any }) => (
    <Box
      bg="$backgroundDark800"
      p="$4"
      borderRadius="$xl"
      mb="$3"
      borderWidth={1}
      borderColor="$trueGray800"
    >
      <VStack space="sm">
        <HStack justifyContent="space-between" alignItems="center">
          <VStack flex={1}>
            <Text color="$white" fontSize="$lg" fontFamily="$heading">
              {item.nameClient}
            </Text>
            <Text color="$trueGray300" fontSize="$sm">
              CPF: {item.cpf}
            </Text>
            <Text color="$trueGray300" fontSize="$sm">
              Tel: {item.phone}
            </Text>
            <Text color="$trueGray300" fontSize="$sm" numberOfLines={2}>
              Endereço: {item.address}
            </Text>
          </VStack>
          
          <VStack space="sm">
            <Pressable
              onPress={() => handleSelectClient(item)}
              bg="$purple700"
              p="$2"
              borderRadius="$lg"
            >
              <Feather name="shopping-bag" size={20} color="white" />
            </Pressable>
            
            <Pressable
              onPress={() => handleDeleteClient(item.id, item.nameClient)}
              bg="$red600"
              p="$2"
              borderRadius="$lg"
            >
              <Ionicons name="trash-outline" size={20} color="white" />
            </Pressable>
          </VStack>
        </HStack>
      </VStack>
    </Box>
  );

  return (
    <Box flex={1} bg="$backgroundDark900" px="$4" pt="$16">
      <BackButton />
      
      <Text 
        size="2xl" 
        color="$textLight0" 
        mt="$4" 
        mb="$4" 
        fontFamily="$heading"
        alignSelf="center"
      >
        Clientes Cadastradas
      </Text>

      <VStack space="md" flex={1}>
        <Input
          placeholder="Buscar cliente..."
          value={searchQuery}
          onChangeText={setSearchQuery}
          placeholderTextColor="$trueGray400"
        />

        {filteredClients.length === 0 ? (
          <Box flex={1} justifyContent="center" alignItems="center">
            <VStack space="md" alignItems="center">
              <Feather name="users" size={64} color="#666" />
              <Text color="$trueGray400" fontSize="$lg" textAlign="center">
                {searchQuery 
                  ? "Nenhum cliente encontrado com essa busca"
                  : "Nenhum cliente cadastrado ainda"
                }
              </Text>
              <Text color="$trueGray500" fontSize="$sm" textAlign="center">
                {searchQuery 
                  ? "Tente uma busca diferente"
                  : "Cadastre clientes na tela de criar sacola"
                }
              </Text>
            </VStack>
          </Box>
        ) : (
          <FlatList
            data={filteredClients}
            renderItem={renderClientItem}
            keyExtractor={(item) => item.id}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={{ paddingBottom: 20 }}
          />
        )}
      </VStack>
    </Box>
  );
} 