import React, { useState } from 'react';
import { FlatList } from 'react-native';
import BackButton from '@components/BackButton';
import { Box, Center, Text, VStack, HStack, Button as GluestackButton, Divider } from '@gluestack-ui/themed';
import { useSales } from '@contexts/SalesContext';
import SaleDetailsModal from '@components/SaleDetailsModal';
import { OpenSaleItem } from '@contexts/SalesContext'; 

import Feather from 'react-native-vector-icons/Feather'; 

export function OpenSales() {
  const { openSales } = useSales();
  const [selectedSale, setSelectedSale] = useState<OpenSaleItem | null>(null);
  const [isDetailsModalVisible, setIsDetailsModalVisible] = useState(false);

  const handleOpenDetails = (sale: OpenSaleItem) => {
    setSelectedSale(sale);
    setIsDetailsModalVisible(true);
  };

  const renderSaleCard = ({ item }: { item: OpenSaleItem }) => {
    const totalValue = item.selectedProducts.reduce((total, product) => total + product.salePrice, 0);
    const itemCount = item.selectedProducts.length;

    return (
      <Box
        mb="$4"
        p="$5"
        bg="$backgroundDark800"
        borderRadius="$xl"
        borderWidth={1}
        borderColor="$trueGray800"
      >
        <HStack justifyContent="space-between" alignItems="center" mb="$3">
          <Text size="lg" color="$textLight0" fontFamily="$heading">
            {item.clientData.nameClient}
          </Text>
          <GluestackButton
            size="sm"
            bg="$purple700"
            rounded="$lg"
            onPress={() => handleOpenDetails(item)}
          >
            <HStack alignItems="center" space="sm" px="$2">
              <Feather name="eye" color="white" size={18} />
              <Text color="$white" fontSize="$sm">Ver Detalhes</Text>
            </HStack>
          </GluestackButton>
        </HStack>

        <Divider my="$3" bg="$trueGray700" />

        <HStack justifyContent="space-around" alignItems="center" mt="$3">
          <VStack alignItems="center">
            <Feather name="shopping-bag" color="#888" size={24} />
            <Text color="$textLight200" mt="$1">
              {itemCount} {itemCount === 1 ? 'item' : 'itens'}
            </Text>
          </VStack>
          <VStack alignItems="center">
            <Feather name="dollar-sign" color="#888" size={24} />
            <Text color="$green400" mt="$1" fontFamily="$heading">
              R$ {totalValue.toFixed(2).replace(".", ",")}
            </Text>
          </VStack>
        </HStack>
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
        />
      )}
    </Box>
  );
}
