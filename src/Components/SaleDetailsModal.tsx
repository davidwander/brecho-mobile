import React, { useMemo, useState, useEffect } from 'react';
import { Modal, FlatList, TouchableOpacity, Alert } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '@routes/AppStackRoutes';
import { useSales } from '@contexts/SalesContext';
import { ClientData, ProductItem } from '../types/SaleTypes';
import { Box, Text, Button, HStack, VStack, Divider } from '@gluestack-ui/themed';

import { useProduct } from '@contexts/ProductContext';
import { CustomToast } from '@components/CustomToast'; 

import Ionicons from 'react-native-vector-icons/Ionicons';
import Entypo from 'react-native-vector-icons/Entypo';
import Feather from 'react-native-vector-icons/Feather';

import uuid from 'react-native-uuid';

interface SaleDetailsModalProps {
  visible: boolean;
  clientData: ClientData | null;
  selectedProducts: ProductItem[];
  onClose: () => void;
  onConfirm: () => void;
  isConfirmMode?: boolean;
  fromStockScreen?: boolean;
  saleId?: string;
}

export function SaleDetailsModal({
  visible,
  clientData,
  selectedProducts = [],
  onClose,
  onConfirm,
  isConfirmMode = true,
  fromStockScreen = false,
  saleId,
}: SaleDetailsModalProps) {
  const { addSale, clearSaleData, cancelSale, addProductsToSale, removeProductFromSale, confirmPayment } = useSales();
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();

  const [showPaymentDialog, setShowPaymentDialog] = React.useState(false);
  const [localProducts, setLocalProducts] = useState<ProductItem[]>(selectedProducts);
  const [removalFeedback, setRemovalFeedback] = useState<{ message: string; type: 'success' | 'error' } | null>(null);
  const [toastMessage, setToastMessage] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  useEffect(() => {
    setLocalProducts(selectedProducts);
  }, [selectedProducts, visible]);

  // Função para mostrar toast
  const showToast = (message: string, type: 'success' | 'error') => {
    setToastMessage({ message, type });
    setTimeout(() => setToastMessage(null), 3000);
  };

  const handleConfirmPayment = () => {
    console.log('handleConfirmPayment chamado');

    setShowPaymentDialog(false);

    if (!saleId) {
      console.log('Erro: saleId não encontrado');
      showToast('Erro: ID da venda não encontrado', 'error');
      return;
    }

    try {
      console.log('Confirmando pagamento para saleId:', saleId);
      confirmPayment(saleId);
      onConfirm();
      console.log('Chamando onClose para fechar o modal');
      onClose();
      showToast('Pagamento confirmado com sucesso!', 'success');
    } catch (error) {
      console.error('Erro ao confirmar pagamento:', error);
      showToast('Erro ao confirmar o pagamento', 'error');
    }
  };

  const { reserveProduct } = useProduct();

  const totalValue = useMemo(() => {
    return localProducts.reduce((total, product) => total + product.salePrice, 0);
  }, [localProducts]);

  const handleRemoveProduct = (productId: string) => {
    if (!saleId) {
      console.warn('ID da venda não fornecido');
      setRemovalFeedback({
        message: 'Erro: ID da venda não encontrado',
        type: 'error',
      });
      setTimeout(() => setRemovalFeedback(null), 10000);
      return;
    }

    try {
      const productToRemove = localProducts.find((p) => p.id === productId);
      const productInfo = productToRemove
        ? productToRemove.type || `COD: ${productToRemove.id}`
        : `Produto ${productId}`;

      removeProductFromSale(saleId, productId);

      setLocalProducts((prevProducts) => prevProducts.filter((p) => p.id !== productId));

      setRemovalFeedback({
        message: `Peça ${productInfo} removida com sucesso!`,
        type: 'success',
      });
      setTimeout(() => setRemovalFeedback(null), 10000);
    } catch (error) {
      console.error('Erro ao remover produto:', error);
      setRemovalFeedback({
        message: 'Erro ao remover a peça',
        type: 'error',
      });
      setTimeout(() => setRemovalFeedback(null), 10000);
    }
  };

  const renderProductItem = ({ item }: { item: ProductItem }) => (
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
            {item.type}
          </Text>
          <Text color="$trueGray300" fontSize="$sm">
            COD: {item.id}
          </Text>
        </VStack>

        {!isConfirmMode && !fromStockScreen && (
          <TouchableOpacity onPress={() => handleRemoveProduct(item.id)}>
            <Ionicons name="trash-outline" size={22} color="red" />
          </TouchableOpacity>
        )}
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

  const handleConfirm = () => {
    console.log('Confirmar clicado');
    console.log('clientData', clientData);
    console.log('selectedProducts', selectedProducts);

    const isValidSale = selectedProducts.every((item) => item.salePrice > 0);
    if (!isValidSale) {
      console.log('Produto com preço de venda inválido');
      return;
    }

    if (saleId) {
      if (selectedProducts.length > 0) {
        addProductsToSale(saleId, selectedProducts);
        clearSaleData();
        onConfirm();
        navigation.navigate('openSales');
      } else {
        console.log('Nenhum produto selecionado para adicionar');
      }
    } else {
      if (clientData && selectedProducts.length > 0) {
        const newSaleId = String(uuid.v4());
        const dateNow = new Date().toISOString();
        addSale({
          id: newSaleId,
          client: clientData,
          products: selectedProducts,
          total: totalValue,
          date: dateNow,
        });
        clearSaleData();
        onConfirm();
        navigation.navigate('openSales');
      } else {
        console.log('Dados incompletos para confirmar a venda');
      }
    }
  };

  const handleAddMoreProducts = () => {
    onClose();
    if (saleId) {
      navigation.navigate('stockUp', { saleId });
    } else {
      console.warn('ID da venda não disponível');
    }
  };

  const handleCancel = () => {
    cancelSale();
    onClose();
  };

  // Função para confirmar pagamento com Alert nativo (funciona melhor no iOS)
  const handleConfirmPaymentPress = () => {
    console.log('Botão Confirmar Pagamento clicado');
    
    // Usando Alert nativo como alternativa mais confiável
    Alert.alert(
      'Confirmar Pagamento',
      'Tem certeza que deseja confirmar o pagamento desta venda?',
      [
        {
          text: 'Cancelar',
          style: 'cancel',
        },
        {
          text: 'Confirmar',
          style: 'default',
          onPress: handleConfirmPayment,
        },
      ],
      { cancelable: true }
    );
  };

  React.useEffect(() => {
    console.log('Estado do showPaymentDialog:', showPaymentDialog);
  }, [showPaymentDialog]);

  const keyExtractor = (item: ProductItem) => item.id;

  return (
    <>
      {/* Toast personalizado */}
      {toastMessage && (
        <CustomToast 
          message={toastMessage.message} 
          type={toastMessage.type} 
        />
      )}

      <Modal
        visible={visible}
        animationType="slide"
        transparent={true}
        onRequestClose={onClose}
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
              {isConfirmMode ? 'Confirmar Venda' : 'Detalhes da Venda'}
            </Text>

            {removalFeedback && (
              <Box
                bg={removalFeedback.type === 'success' ? '$green600' : '$red600'}
                borderRadius="$lg"
                px="$5"
                py="$4"
                alignSelf="center"
                borderColor={removalFeedback.type === 'success' ? '$green500' : '$red500'}
                softShadow="2"
                maxWidth="$full"
                mx="$2"
                position="absolute"
                top="$4"
                left={25}
                right={0}
                role="alertdialog"
                aria-live="assertive"
                $base-animation={{
                  initial: { opacity: 0, translateY: -20 },
                  animate: { opacity: 1, translateY: 0 },
                  exit: { opacity: 0, translateY: -20 },
                  transition: { duration: 300, easing: 'ease-in-out' },
                }}
              >
                <HStack alignItems="center" space="md">
                  <Ionicons
                    name={removalFeedback.type === 'success' ? 'checkmark-circle-outline' : 'alert-circle-outline'}
                    size={24}
                    color="$white"
                  />
                  <Text
                    color="$white"
                    fontSize="$lg"
                    fontWeight="$medium"
                    fontFamily="$body"
                    lineHeight="$lg"
                    flex={1}
                    numberOfLines={2}
                    ellipsizeMode="tail"
                  >
                    {removalFeedback.message}
                  </Text>
                  <TouchableOpacity
                    onPress={() => setRemovalFeedback(null)}
                    accessibilityLabel="Fechar mensagem de feedback"
                  >
                    <Ionicons name="close-outline" size={20} color="$white" />
                  </TouchableOpacity>
                </HStack>
              </Box>
            )}

            {clientData && (
              <Box mb="$4" p="$3" bg="$backgroundDark800" borderRadius="$xl">
                <Text size="lg" color="$textLight0" fontFamily="$heading" mb="$2">
                  Dados do Cliente
                </Text>
                <VStack space="sm">
                  <Text color="$textLight200" lineHeight="$sm">
                    Nome: {clientData.nameClient}
                  </Text>
                  <Text color="$textLight200" lineHeight="$sm">
                    Tel: {clientData.phone}
                  </Text>
                  <Text color="$textLight200" lineHeight="$sm">
                    CPF: {clientData.cpf}
                  </Text>
                  <Text color="$textLight200" lineHeight="$sm">
                    Endereço: {clientData.address}
                  </Text>
                </VStack>
              </Box>
            )}

            <Text size="lg" color="$textLight0" fontFamily="$heading" mb="$2">
              Peças Selecionadas ({localProducts.length})
            </Text>

            {localProducts.length === 0 ? (
              <Text color="$textLight200" mb="$4" textAlign="center">
                Nenhuma peça selecionada.
              </Text>
            ) : (
              <Box height="45%" mb="$4">
                <FlatList
                  data={localProducts}
                  renderItem={renderProductItem}
                  keyExtractor={keyExtractor}
                  showsVerticalScrollIndicator={true}
                />
              </Box>
            )}

            <Box bg="$backgroundDark800" p="$3" borderRadius="$lg" mb="$4">
              <HStack justifyContent="space-between" alignItems="center">
                <Text color="$white" fontSize="$lg" fontFamily="$heading">
                  Valor Total:
                </Text>
                <Text color="$green400" fontSize="$xl" fontFamily="$heading">
                  R$ {totalValue.toFixed(2).replace('.', ',')}
                </Text>
              </HStack>
            </Box>

            {isConfirmMode ? (
              <HStack justifyContent="space-between" mt="$2">
                <Button
                  w={fromStockScreen ? '48%' : '32%'}
                  bg="$red600"
                  rounded="$xl"
                  onPress={handleCancel}
                >
                  <HStack alignItems="center" space="sm">
                    <Ionicons name="close-circle-outline" color="white" size={20} />
                    <Text color="$white" fontSize="$md" fontFamily="$heading" lineHeight="$sm">
                      Cancelar
                    </Text>
                  </HStack>
                </Button>

                {!fromStockScreen && (
                  <Button
                    w="32%"
                    bg="$blue600"
                    rounded="$xl"
                    onPress={handleAddMoreProducts}
                  >
                    <HStack alignItems="center" space="sm">
                      <Ionicons name="add-circle-outline" color="white" size={20} />
                      <Text color="$white" fontSize="$md" fontFamily="$heading" lineHeight="$md">
                        Mais Peças
                      </Text>
                    </HStack>
                  </Button>
                )}

                <Button
                  w={fromStockScreen ? '48%' : '32%'}
                  bg="$green600"
                  rounded="$xl"
                  onPress={handleConfirm}
                >
                  <HStack alignItems="center" space="sm">
                    <Ionicons name="checkmark-circle-outline" color="white" size={20} />
                    <Text color="$white" fontSize="$md" fontFamily="$heading" lineHeight="$sm">
                      Confirmar
                    </Text>
                  </HStack>
                </Button>
              </HStack>
            ) : (
              <>
                <HStack justifyContent="space-between" mt="$2">
                  <Button
                    w="48%"
                    bg="$red600"
                    rounded="$xl"
                    onPress={onClose}
                  >
                    <HStack alignItems="center" space="sm">
                      <Ionicons name="close-circle-outline" color="white" size={20} />
                      <Text color="$white" fontSize="$md" fontFamily="$heading" lineHeight="$sm">
                        {localProducts.length === 0 ? 'Concluído' : 'Fechar'}
                      </Text>
                    </HStack>
                  </Button>

                  <Button
                    w="48%"
                    bg="$purple600"
                    rounded="$xl"
                    onPress={handleAddMoreProducts}
                  >
                    <HStack alignItems="center" space="sm">
                      <Ionicons name="add-circle-outline" color="white" size={20} />
                      <Text color="$white" fontSize="$md" fontFamily="$heading" lineHeight="$sm">
                        Mais Peças
                      </Text>
                    </HStack>
                  </Button>
                </HStack>

                {/* Botão com Alert nativo (mais confiável) */}
                <Button
                  mt="$2"
                  h="$11"
                  bg="$teal600"
                  rounded="$xl"
                  onPress={handleConfirmPaymentPress}
                  accessibilityLabel="Confirmar pagamento da venda"
                >
                  <HStack alignItems="center" space="sm" justifyContent="center">
                    <Ionicons name="cash-outline" color="white" size={20} />
                    <Text color="$white" fontSize="$md" fontFamily="$heading" lineHeight="$md">
                      Confirmar Pagamento
                    </Text>
                  </HStack>
                </Button>
              </>
            )}
          </Box>
        </Box>
      </Modal>

      {/* Modal customizado para confirmação (mantido como alternativa) */}
      <Modal
        visible={showPaymentDialog}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setShowPaymentDialog(false)}
      >
        <Box
          flex={1}
          justifyContent="center"
          alignItems="center"
          style={{ backgroundColor: '#000000cc' }}
        >
          <Box
            bg="$backgroundDark900"
            borderRadius="$2xl"
            p="$6"
            width="80%"
            alignItems="center"
          >
            <Text fontFamily="$heading" fontSize="$lg" color="$white" mb="$4" lineHeight="$md">
              Confirmar Pagamento
            </Text>

            <Text color="$textLight200" fontSize="$md" mb="$6" textAlign="center">
              Tem certeza que deseja confirmar o pagamento desta venda?
            </Text>

            <HStack space="md" width="100%" justifyContent="space-between">
              <Button
                flex={1}
                variant="outline"
                borderColor="$trueGray600"
                rounded="$lg"
                onPress={() => setShowPaymentDialog(false)}
              >
                <Text color="$white">Cancelar</Text>
              </Button>

              <Button
                flex={1}
                bg="$green600"
                rounded="$lg"
                onPress={handleConfirmPayment}
              >
                <Text color="$white" lineHeight="$sm">
                  Confirmar
                </Text>
              </Button>
            </HStack>
          </Box>
        </Box>
      </Modal>
    </>
  );
}