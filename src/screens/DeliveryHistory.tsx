import React, { useState } from 'react';
import { FlatList, TouchableOpacity, Modal } from 'react-native';
import { Box, Center, Text, VStack, HStack, Divider, Pressable } from '@gluestack-ui/themed';
import { useDelivery, DeliveryItem } from '@contexts/DeliveryContext';
import Feather from 'react-native-vector-icons/Feather';
import Ionicons from 'react-native-vector-icons/Ionicons';
import Entypo from 'react-native-vector-icons/Entypo';
import BackButton from '@components/BackButton';

const formatDateToLocal = (dateString: string): string => {
  const [year, month, day] = dateString.split('-').map(Number);
  const date = new Date(year, month - 1, day);
  return date.toLocaleDateString('pt-BR');
};

export function DeliveryHistory() {
  const { deliveredItems } = useDelivery();
  const [selectedItem, setSelectedItem] = useState<DeliveryItem | null>(null);

  const renderDeliveryCard = ({ item }: { item: DeliveryItem }) => {
    const totalValue = item.selectedProducts.reduce(
      (total, product) => total + (product.salePrice * (product.quantity || 1)),
      0
    );
    const freightValue = item.freightValue || 0;
    const totalWithFreight = totalValue + freightValue;

    return (
      <TouchableOpacity onPress={() => setSelectedItem(item)}>
        <Box
          mb="$3"
          p="$3"
          bg="$backgroundDark800"
          borderRadius="$xl"
          position="relative"
          overflow="hidden"
        >
          <Box
            position="absolute"
            top={0}
            left={-1}
            right={-1}
            bottom={0}
            width={4}
            bg="$purple600"
            zIndex={-1}
          />
          <HStack justifyContent="space-between" alignItems="center">
            <HStack gap="$2" alignItems="center">
              <Feather name="user" size={20} color="#a78bfa" />
              <Text 
                color="$textLight0" 
                fontFamily="$heading" 
                size="md"
                lineHeight="$md"
              >
                {item.clientData.nameClient || 'Cliente desconhecido'}
              </Text>
            </HStack>
            <HStack space="sm" alignItems="center">
              <Feather name="calendar" color="#60a5fa" size={16} />
              <Text color="$textLight200" size="sm">
                {item.deliveredDate ? formatDateToLocal(item.deliveredDate) : 'N/A'}
              </Text>
            </HStack>
          </HStack>
          <HStack justifyContent="flex-end" mt="$1">
            <Text color="$green400" fontFamily="$heading" size="md">
              R$ {totalWithFreight.toFixed(2).replace('.', ',')}
            </Text>
          </HStack>
        </Box>
      </TouchableOpacity>
    );
  };

  const renderModalContent = () => {
    if (!selectedItem) return null;

    const totalValue = selectedItem.selectedProducts.reduce(
      (total, product) => total + (product.salePrice * (product.quantity || 1)),
      0
    );
    const itemCount = selectedItem.selectedProducts.reduce((acc, p) => acc + (p.quantity || 1), 0);
    const freightValue = selectedItem.freightValue || 0;
    const totalWithFreight = totalValue + freightValue;

    return (
      <Box bg="$backgroundDark800" p="$5" borderRadius="$2xl" m="$4">
        <VStack space="md">
          <HStack justifyContent="space-between" alignItems="center">
            <HStack space="sm" alignItems="center">
              <Feather name="user" size={20} color="#a78bfa" />
              <Text size="lg" color="$textLight0" fontFamily="$heading">
                {selectedItem.clientData.nameClient || 'Cliente desconhecido'}
              </Text>
            </HStack>
            <Pressable onPress={() => setSelectedItem(null)}>
              <Feather name="x" size={24} color="$textLight200" />
            </Pressable>
          </HStack>

          <Divider bg="$trueGray600" />

          <VStack space="sm">
            <Text color="$textLight100" fontFamily="$heading" size="md">
              Produtos
            </Text>
            {selectedItem.selectedProducts.map((product, index) => (
              <VStack key={index} space="xs" bg="$backgroundDark700" p="$3" borderRadius="$md">
                <HStack justifyContent="space-between" alignItems="center">
                  <Text color="$textLight0" size="sm" fontFamily="$heading" flex={1}>
                    {product.name || `Produto ${index + 1}`}
                  </Text>
                  <Text color="$green400" size="sm">
                    R$ {(product.salePrice * (product.quantity || 1)).toFixed(2).replace('.', ',')}
                  </Text>
                </HStack>
                <HStack justifyContent="space-between">
                  <Text color="$textLight200" size="xs">
                    Quantidade: {product.quantity || 1}
                  </Text>
                  <Text color="$textLight200" size="xs">
                    Preço unitário: R$ {product.salePrice.toFixed(2).replace('.', ',')}
                  </Text>
                </HStack>
                {product.type && (
                  <Text color="$textLight200" size="xs">
                    Tipo: {product.type}
                  </Text>
                )}
                {product.description && (
                  <Text color="$textLight200" size="xs" numberOfLines={2}>
                    Descrição: {product.description}
                  </Text>
                )}
              </VStack>
            ))}
            <Divider bg="$trueGray600" my="$2" />

            <HStack justifyContent="space-between">
              <HStack space="sm" alignItems="center">
                <Feather name="shopping-bag" color="#60a5fa" size={20} />
                <Text color="$textLight200" lineHeight="$sm">
                  {itemCount} {itemCount === 1 ? 'item' : 'itens'}
                </Text>
              </HStack>
              <Text color="$green400" fontFamily="$heading" size="md">
                R$ {totalValue.toFixed(2).replace('.', ',')}
              </Text>
            </HStack>

            <HStack justifyContent="space-between">
              <HStack space="sm" alignItems="center">
                <Ionicons name="car" color="#60a5fa" size={20} />
                <Text color="$textLight200" lineHeight="$sm">
                  Frete: R$ {freightValue.toFixed(2).replace('.', ',')}
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
                  Entregue em: {selectedItem.deliveredDate ? formatDateToLocal(selectedItem.deliveredDate) : 'N/A'}
                </Text>
              </HStack>
            </HStack>

            <HStack justifyContent="flex-end">
              <HStack space="sm" alignItems="center">
                <Feather name="dollar-sign" color="#34d399" size={20} />
                <Text color="$green400" fontFamily="$heading" size="md">
                  Total: R$ {totalWithFreight.toFixed(2).replace('.', ',')}
                </Text>
              </HStack>
            </HStack>
          </VStack>
        </VStack>
      </Box>
    );
  };

  return (
    <Box flex={1} bg="$backgroundDark950" pt="$16" px="$4">
      <BackButton />
      <Center mb="$6">
        <Text size="2xl" color="$textLight0" fontFamily="$heading">
          Histórico de Entregas
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
              Nenhuma entrega concluída.
            </Text>
          </Center>
        )}
      />

      <Modal
        visible={!!selectedItem}
        transparent
        animationType="fade"
        onRequestClose={() => setSelectedItem(null)}
      >
        <Box flex={1} bg="$backgroundDark950" opacity={0.95} justifyContent="center">
          {renderModalContent()}
        </Box>
      </Modal>
    </Box>
  );
}