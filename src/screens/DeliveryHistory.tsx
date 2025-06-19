import React, { useState } from 'react';
import { FlatList, TouchableOpacity, Modal as RNModal } from 'react-native';
import { Box, Center, Text, VStack, HStack, Divider, Button as GluestackButton } from '@gluestack-ui/themed';
import { useDelivery, DeliveryItem } from '@contexts/DeliveryContext';
import Feather from 'react-native-vector-icons/Feather';
import Ionicons from 'react-native-vector-icons/Ionicons';
import Entypo from 'react-native-vector-icons/Entypo';
import BackButton from '@components/BackButton';

interface ProductType {
  id: string;
  type?: string;
  costPrice: number;
  salePrice: number;
  quantity?: number;
}

const formatDateToLocal = (dateString: string): string => {
  const [year, month, day] = dateString.split('-').map(Number);
  const date = new Date(year, month - 1, day);
  return date.toLocaleDateString('pt-BR');
};

export function DeliveryHistory() {
  const { deliveredItems } = useDelivery();
  const [selectedItem, setSelectedItem] = useState<DeliveryItem | null>(null);

  const renderProductItem = ({ item }: { item: ProductType }) => (
    <Box
      bg="$backgroundDark800"
      p="$3"
      borderRadius="$xl"
      mb="$2"
      borderWidth={1}
      borderColor="$trueGray800"
    >
      <HStack justifyContent="space-between" alignItems="center">
        <VStack>
          <Text color="$white" fontSize="$md" fontFamily="$heading">
            {item.type || 'Tipo não especificado'}
          </Text>
          <Text color="$trueGray300" fontSize="$sm">
            COD: {item.id}
          </Text>
        </VStack>
      </HStack>

      <Divider my="$2" bg="$trueGray700" />

      <HStack mt="$2" alignItems="center" justifyContent="space-between">
        <HStack alignItems="center" gap="$1">
          <Feather name="dollar-sign" size={16} color="#888" />
          <Text color="$white" fontSize="$sm">
            Custo: R$ {item.costPrice.toFixed(2).replace('.', ',')}
          </Text>
        </HStack>
        <HStack alignItems="center" gap="$1">
          <Entypo name="price-tag" size={16} color="#888" />
          <Text color="$white" fontSize="$sm">
            Venda: R$ {item.salePrice.toFixed(2).replace('.', ',')}
          </Text>
        </HStack>
      </HStack>
    </Box>
  );

  const renderDeliveryCard = ({ item }: { item: DeliveryItem }) => (
    <TouchableOpacity onPress={() => setSelectedItem(item)}>
      <Box mb="$5" p="$5" bg="$backgroundDark800" borderRadius="$3xl">
        <VStack space="md">
          <HStack justifyContent="space-between" alignItems="center">
            <HStack space="sm" alignItems="center">
              <Feather name="user" size={20} color="#a78bfa" />
              <Text size="lg" color="$textLight0" fontFamily="$heading">
                {item.clientData.nameClient || 'Cliente desconhecido'}
              </Text>
            </HStack>
          </HStack>

          <HStack justifyContent="space-between">
            <HStack space="sm" alignItems="center">
              <Feather name="calendar" color="#60a5fa" size={20} />
              <Text color="$textLight200" lineHeight="$sm">
                Entregue em: {item.deliveredDate ? formatDateToLocal(item.deliveredDate) : 'Data não disponível'}
              </Text>
            </HStack>
          </HStack>
        </VStack>
      </Box>
    </TouchableOpacity>
  );

  return (
    <Box flex={1} bg="$backgroundDark950" pt="$16" px="$4">
      <BackButton />
      <Center mb="$6">
        <Text size="2xl" color="$textLight0" fontFamily="$heading">
          Histórico de vendas
        </Text>
      </Center>

      <FlatList
        showsVerticalScrollIndicator={false}
        data={deliveredItems}
        keyExtractor={(item) => item.id}
        renderItem={renderDeliveryCard}
        contentContainerStyle={{ paddingBottom: 24, flexGrow: 1 }}
        ListEmptyComponent={() => (
          <Center mt="$10" flex={1}>
            <Text color="$textLight400" lineHeight="$md">
              Nenhuma venda concluída.
            </Text>
          </Center>
        )}
      />

      <RNModal
        visible={!!selectedItem}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setSelectedItem(null)}
      >
        <Box
          flex={1}
          justifyContent="center"
          alignItems="center"
          style={{ backgroundColor: 'rgba(0, 0, 0, 0.7)' }}
        >
          <Box
            bg="$backgroundDark900"
            p="$6"
            borderRadius="$2xl"
            width="90%"
            maxHeight="80%"
          >
            <Text
              textAlign="center"
              fontSize="$xl"
              fontFamily="$heading"
              color="$white"
              mb="$4"
              lineHeight="$md"
            >
              Detalhes da venda
            </Text>

            {selectedItem && (
              <>
                <Box mb="$4" p="$3" bg="$backgroundDark800" borderRadius="$xl">
                  <Text size="lg" color="$textLight0" fontFamily="$heading" mb="$2">
                    Dados da Cliente
                  </Text>
                  <VStack space="sm">
                    <Text color="$textLight200" lineHeight="$sm">
                      Nome: {selectedItem.clientData.nameClient}
                    </Text>
                  </VStack>
                </Box>

                <Text size="lg" color="$textLight0" fontFamily="$heading" mb="$2">
                  Peças Selecionadas ({selectedItem.selectedProducts.length})
                </Text>

                <Box height="35%" mb="$4">
                  <FlatList
                    data={selectedItem.selectedProducts}
                    renderItem={renderProductItem}
                    keyExtractor={(item) => item.id}
                    showsVerticalScrollIndicator={true}
                  />
                </Box>

                <Box bg="$backgroundDark800" p="$3" borderRadius="$lg" mb="$4">
                  <HStack justifyContent="space-between" alignItems="center">
                    <Text color="$white" fontSize="$lg" fontFamily="$heading">
                      Valor Total:
                    </Text>
                    <Text color="$green400" fontSize="$xl" fontFamily="$heading">
                      R$ {(selectedItem.selectedProducts.reduce(
                        (total, product) => total + (product.salePrice * (product.quantity || 1)),
                        0
                      ) + (selectedItem.freightValue || 0)).toFixed(2).replace('.', ',')}
                    </Text>
                  </HStack>
                </Box>

                <VStack space="sm">
                  <HStack justifyContent="space-between">
                    <HStack space="sm" alignItems="center">
                      <Ionicons name="car" color="#60a5fa" size={20} />
                      <Text color="$textLight200" lineHeight="$sm">
                        Frete: R$ {(selectedItem.freightValue || 0).toFixed(2).replace('.', ',')}
                      </Text>
                    </HStack>

                    <HStack space="sm" alignItems="center">
                      <Feather name="check-circle" color="#34d399" size={20} />
                      <Text color="$green400" fontFamily="$heading" size="sm">
                        Frete Pago
                      </Text>
                    </HStack>
                  </HStack>

                  <HStack justifyContent="space-between">
                    <HStack space="sm" alignItems="center">
                      <Feather name="calendar" color="#60a5fa" size={20} />
                      <Text color="$textLight200" lineHeight="$sm">
                        Entregue em: {selectedItem.deliveredDate ? formatDateToLocal(selectedItem.deliveredDate) : 'Data não disponível'}
                      </Text>
                    </HStack>
                  </HStack>

                  <Divider mt="$4" />

                  <GluestackButton 
                    onPress={() => setSelectedItem(null)} 
                    mt="$4"
                    bg="$red600"
                    rounded="$2xl"
                    h="$11"
                    justifyContent="center"
                  >
                    <Text 
                      fontFamily="$heading" 
                      fontSize="$md" 
                      lineHeight="$md" 
                      color="$textLight0" 
                      textAlign="center"
                    >
                      Fechar
                    </Text>
                  </GluestackButton>
                </VStack>
              </>
            )}
          </Box>
        </Box>
      </RNModal>
    </Box>
  );
}