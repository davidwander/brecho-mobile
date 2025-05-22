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

import Feather from 'react-native-vector-icons/Feather';
import FontAwesome from 'react-native-vector-icons/FontAwesome';
import Ionicons from 'react-native-vector-icons/Ionicons';

export function OpenSales() {
  const { openSales, deleteSale } = useSales();
  const [selectedSale, setSelectedSale] = useState<OpenSaleItem | null>(null);
  const [isDetailsModalVisible, setIsDetailsModalVisible] = useState(false);
  const [isDeleteModalVisible, setIsDeleteModalVisible] = useState(false);
  const [saleToDelete, setSaleToDelete] = useState<string | null>(null);
  const [deleteFeedback, setDeleteFeedback] = useState<{ message: string; type: 'success' | 'error' } | null>(null);
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
      setDeleteFeedback({
        message: 'Venda excluída com sucesso!',
        type: 'success',
      });
      setTimeout(() => {
        setDeleteFeedback(null);
      }, 5000);
    } catch (error) {
      console.error('Erro ao excluir venda:', error);
      setDeleteFeedback({
        message: 'Erro ao excluir a venda',
        type: 'error',
      });
      setTimeout(() => {
        setDeleteFeedback(null);
      }, 5000);
    } finally {
      setIsDeleteModalVisible(false);
      setSaleToDelete(null);
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
          bg="$purple700"
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
                  <Text 
                    color="$white" 
                    fontSize="$sm"
                    lineHeight="$sm"
                  >
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
                  <Text 
                    color="$white" 
                    fontSize="$sm"
                    lineHeight="$sm">
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

      {deleteFeedback && (
        <Box
          bg={deleteFeedback.type === 'success' ? '$green700' : '$red700'}
          borderRadius="$lg"
          mb="$3"
          px="$3"
          py="$2"
          borderWidth={1}
          borderColor={deleteFeedback.type === 'success' ? '$green800' : '$red800'}
          softShadow="1"
          maxWidth="$full"
          mx="$2"
          role="alert"
          aria-live="polite"
          $base-animation={{
            initial: { opacity: 0, translateY: -10 },
            animate: { opacity: 1, translateY: 0 },
            transition: { duration: 600, easing: 'ease-in-out' },
          }}
        >
          <HStack alignItems="center" space="sm">
            <Ionicons
              name={deleteFeedback.type === 'success' ? 'checkmark-circle-outline' : 'alert-circle-outline'}
              size={20}
              color="$white"
            />
            <Text
              color="$white"
              fontSize="$sm"
              fontWeight="$normal"
              fontFamily="$body"
              lineHeight="$sm"
              flex={1}
              numberOfLines={2}
              ellipsizeMode="tail"
            >
              {deleteFeedback.message}
            </Text>
          </HStack>
        </Box>
      )}

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
        <ModalContent bg="$backgroundDark800" borderRadius="$lg" p="$6" width="80%">
          <ModalHeader alignSelf="center">
            <Text 
              fontFamily="$heading" 
              fontSize="$lg" 
              color="$white" 
              lineHeight="$md"
            >
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
                <Text color="$white">Cancelar</Text>
              </GluestackButton>
              <GluestackButton
                flex={1}
                bg="$red700"
                rounded="$lg"
                onPress={handleConfirmDelete}
              >
                <Text color="$white">Excluir</Text>
              </GluestackButton>
            </HStack>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </Box>
  );
}