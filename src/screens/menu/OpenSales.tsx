import React, { useState } from 'react';
import { FlatList } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '@routes/AppStackRoutes';

import BackButton from '@components/BackButton';
import {
  Box,
  Center,
  Text,
  VStack,
  HStack,
  Button as GluestackButton,
  Divider,
  Modal,
  ModalBackdrop,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
} from '@gluestack-ui/themed';
import { useSales } from '@contexts/SalesContext';
import { SaleDetailsModal } from '@components/SaleDetailsModal';
import { OpenSaleItem } from '@contexts/SalesContext';
import { CustomToast } from '@components/CustomToast'; // Importar o novo componente

import Feather from 'react-native-vector-icons/Feather';
import FontAwesome from 'react-native-vector-icons/FontAwesome';
import Ionicons from 'react-native-vector-icons/Ionicons';

export function OpenSales() {
  const { openSales, deleteSale } = useSales();
  const [selectedSale, setSelectedSale] = useState<OpenSaleItem | null>(null);
  const [isDetailsModalVisible, setIsDetailsModalVisible] = useState(false);
  const [isDeleteModalVisible, setIsDeleteModalVisible] = useState(false);
  const [saleToDelete, setSaleToDelete] = useState<string | null>(null);
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();

  const handleOpenDetails = (sale: OpenSaleItem) => {
    setSelectedSale(sale);
    setIsDetailsModalVisible(true);
  };

  const handleOpenDeleteModal = (saleId: string) => {
    setSaleToDelete(saleId);
    setIsDeleteModalVisible(true);
  };

  const handleConfirmDelete = () => {
    if (!saleToDelete) return;

    try {
      deleteSale(saleToDelete);
      setIsDeleteModalVisible(false);
      setSaleToDelete(null);
      return <CustomToast message="Venda excluída com sucesso!" type="success" />;
    } catch (error) {
      console.error('Erro ao excluir venda:', error);
      setIsDeleteModalVisible(false);
      setSaleToDelete(null);
      return <CustomToast message="Erro ao excluir a venda" type="error" />;
    }
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
        position="relative"
        overflow="hidden"
      >
        <Box
          position="absolute"
          top={0}
          left={-1}
          right={-1}
          bottom={0}
          width={6}
          bg={item.isPaid ? "$green600" : "$purple700"}
          zIndex={-1}
        />
        <VStack space="md">
          <HStack justifyContent="space-between" alignItems="center">
            <HStack space="sm" alignItems="center">
              <Feather name="user" size={20} color="#a78bfa" />
              <Text size="lg" color="$textLight0" fontFamily="$heading">
                {item.clientData.nameClient || 'Cliente desconhecido'}
              </Text>
            </HStack>

            <HStack space="sm">
              <GluestackButton
                size="sm"
                bg="$purple700"
                rounded="$xl"
                onPress={() => handleOpenDetails(item)}
                accessibilityLabel={`Ver detalhes da venda de ${item.clientData.nameClient || 'cliente desconhecido'}`}
              >
                <HStack alignItems="center" space="xs" px="$2">
                  <FontAwesome name="eye" color="white" size={16} />
                  <Text color="$white" fontSize="$sm">
                    Detalhes
                  </Text>
                </HStack>
              </GluestackButton>

              <GluestackButton
                size="sm"
                bg="$red700"
                rounded="$xl"
                onPress={() => handleOpenDeleteModal(item.id)}
                accessibilityLabel={`Excluir venda de ${item.clientData.nameClient || 'cliente desconhecido'}`}
              >
                <HStack alignItems="center" space="xs" px="$2">
                  <Feather name="trash" color="white" size={16} />
                  <Text color="$white" fontSize="$sm">
                    Excluir
                  </Text>
                </HStack>
              </GluestackButton>
            </HStack>
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
        showsVerticalScrollIndicator={false}
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
          fromStockScreen={false}
          saleId={selectedSale.id}
        />
      )}

      <Modal
        isOpen={isDeleteModalVisible}
        onClose={() => setIsDeleteModalVisible(false)}
      >
        <ModalBackdrop />
        <ModalContent bg="$backgroundDark800" borderRadius="$xl" p="$6" width="80%">
          <ModalHeader alignSelf='center'>
            <Text fontFamily="$heading" fontSize="$lg" color="$white" lineHeight="$md">
              Confirmar Exclusão
            </Text>
          </ModalHeader>
          <ModalBody>
            <Text color="$textLight200" fontSize="$md" textAlign="center">
              Tem certeza que deseja excluir esta venda? Essa ação não pode ser desfeita.
            </Text>
          </ModalBody>
          <ModalFooter>
            <HStack space="md" width="100%" justifyContent="space-between">
              <GluestackButton
                flex={1}
                variant="outline"
                borderColor="$trueGray600"
                rounded="$lg"
                onPress={() => setIsDeleteModalVisible(false)}
              >
                <Text color="$white" lineHeight="$sm">Cancelar</Text>
              </GluestackButton>
              <GluestackButton
                flex={1}
                bg="$red700"
                rounded="$lg"
                onPress={handleConfirmDelete}
              >
                <Text color="$white" lineHeight="$sm">Excluir</Text>
              </GluestackButton>
            </HStack>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </Box>
  );
}