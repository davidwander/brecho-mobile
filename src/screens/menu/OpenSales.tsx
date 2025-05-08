import React, { useState } from 'react';
import { FlatList } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '@routes/AppStackRoutes';

import BackButton from '@components/BackButton';
import { Box, Center, Text, VStack, HStack, Button as GluestackButton, Divider,
} from '@gluestack-ui/themed';
import { useSales } from '@contexts/SalesContext';
import { SaleDetailsModal } from '@components/SaleDetailsModal';
import { OpenSaleItem } from '@contexts/SalesContext';

import Feather from 'react-native-vector-icons/Feather';
import FontAwesome from 'react-native-vector-icons/FontAwesome';

export function OpenSales() {
  const { openSales } = useSales();
  const [selectedSale, setSelectedSale] = useState<OpenSaleItem | null>(null);
  const [isDetailsModalVisible, setIsDetailsModalVisible] = useState(false);
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();

  const handleOpenDetails = (sale: OpenSaleItem) => {
    setSelectedSale(sale);
    setIsDetailsModalVisible(true);
  };

  const renderSaleCard = ({ item }: { item: OpenSaleItem }) => {
    const totalValue = item.selectedProducts.reduce(
      (total, product) => total + product.salePrice,
      0
    );
    const itemCount = item.selectedProducts.length;

    return (
      <Box
        mb="$5"
        p="$5"
        bg="$backgroundDark800"
        borderRadius="$2xl"
        borderWidth={1}
        borderColor="$trueGray700"
        shadowColor="black"
        shadowOffset={{ width: 0, height: 2 }}
        shadowOpacity={0.2}
        shadowRadius={4}
      >
        <VStack space="md">
          <HStack justifyContent="space-between" alignItems="center">
            <HStack space="sm" alignItems="center">
              <Feather name="user" size={20} color="#a78bfa" />
              <Text size="lg" color="$textLight0" fontFamily="$heading">
                {item.clientData.nameClient || 'Cliente desconhecido'}
              </Text>
            </HStack>

            <GluestackButton
              size="sm"
              bg="$purple700"
              rounded="$xl"
              onPress={() => handleOpenDetails(item)}
            >
              <HStack alignItems="center" space="xs" px="$2">
                <FontAwesome name="eye" color="white" size={16} />
                <Text color="$white" fontSize="$sm">
                  Detalhes
                </Text>
              </HStack>
            </GluestackButton>
          </HStack>

          <Divider bg="$trueGray700" />

          <HStack justifyContent="space-between" mt="$2">
            <HStack space="sm" alignItems="center">
              <Feather name="shopping-bag" color="#60a5fa" size={20} />
              <Text color="$textLight200">
                {itemCount} {itemCount === 1 ? 'item' : 'itens'}
              </Text>
            </HStack>

            <HStack space="sm" alignItems="center">
              <Feather name="dollar-sign" color="#34d399" size={20} />
              <Text color="$green400" fontFamily="$heading" size="md">
                R$ {totalValue.toFixed(2).replace('.', ',')}
              </Text>
            </HStack>
          </HStack>
        </VStack>
      </Box>
    );
  };

  return (
    <Box flex={1} bg="$backgroundDark950" pt="$16" px="$4">
      <BackButton />
      <Center mb="$6">
        <Text size="2xl" color="$textLight0" fontFamily="$heading">
          Vendas em Aberto
        </Text>
      </Center>

      <FlatList<OpenSaleItem>
        data={openSales}
        keyExtractor={(_, index) => index.toString()}
        renderItem={renderSaleCard}
        contentContainerStyle={{ paddingBottom: 24, flexGrow: 1 }}
        ListEmptyComponent={() => (
          <Center mt="$10" flex={1}>
            <Text color="$textLight400" lineHeight="$md">
              Nenhuma venda em aberto para exibir.
            </Text>
          </Center>
        )}
      />

      {selectedSale && (
        <SaleDetailsModal
          visible={isDetailsModalVisible}
          clientData={selectedSale.clientData}
          selectedProducts={selectedSale.selectedProducts}
          onClose={() => {
            setIsDetailsModalVisible(false);
            setSelectedSale(null);
          }}
          onConfirm={() => {
            setIsDetailsModalVisible(false);
            setSelectedSale(null);
          }}
          isConfirmMode={false}
          fromStockScreen={false} // <- Mudei para false para mostrar o botão de "Mais Peças"
        />
      )}
    </Box>
  );
}