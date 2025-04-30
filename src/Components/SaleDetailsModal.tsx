import React, { useMemo } from 'react';
import { Modal, FlatList } from 'react-native';

import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '@routes/AppStackRoutes';
import { ClientData, ProductItem, useSales } from '@contexts/SalesContext';
import { Box, Text, Button, HStack, VStack, Divider } from '@gluestack-ui/themed';

import { Check, X, Tag, DollarSign } from 'lucide-react-native';

import uuid from 'react-native-uuid';

interface SaleDetailsModalProps {
  visible: boolean;
  clientData: ClientData | null;
  selectedProducts: ProductItem[];
  onClose: () => void;
  onConfirm: () => void;
  isConfirmMode?: boolean;
}

export default function SaleDetailsModal({
  visible,
  clientData,
  selectedProducts,
  onClose,
  onConfirm,
  isConfirmMode = true,
}: SaleDetailsModalProps) {
  const { addSale, clearSaleData } = useSales();

  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();

  const handleConfirmSale = () => {
    const total = selectedProducts.reduce((sum, p) => sum + p.salePrice, 0);
    const sale = {
      id: String(uuid.v4()),
      client: clientData!,
      products: selectedProducts,
      total,
      date: new Date().toISOString(),
    };
  
    addSale(sale); 
    clearSaleData(); 
    navigation.navigate("openSales");
  };

  const totalValue = useMemo(() => {
    return selectedProducts.reduce((total, product) => total + product.salePrice, 0);
  }, [selectedProducts]);

  const renderProductItem = ({ item }: { item: ProductItem }) => (
    <Box 
      bg="$backgroundDark800"
      p="$3"
      borderRadius="$lg"
      mb="$2"
      borderWidth={1}
      borderColor="$trueGray800"
    >
      <HStack justifyContent="space-between" alignItems="center">
        <Text color="$white" fontSize="$md" fontFamily="$heading">{item.type}</Text>
        <Text color="$trueGray300" fontSize="$sm">COD: {item.id}</Text>
      </HStack>
      <Divider my="$2" bg="$trueGray700" />
      <HStack mt="$2" alignItems="center" justifyContent="space-between">
        <HStack alignItems="center" gap="$1">
          <DollarSign size={16} color="#888" />
          <Text color="$white" fontSize="$sm">
            Custo: R$ {item.costPrice.toFixed(2).replace(".", ",")}
          </Text>
        </HStack>
        <HStack alignItems="center" gap="$1">
          <Tag size={16} color="#888" />
          <Text color="$white" fontSize="$sm">
            Venda: R$ {item.salePrice.toFixed(2).replace(".", ",")}
          </Text>
        </HStack>
      </HStack>
    </Box>
  );

  const handleConfirm = () => {
    if (clientData && selectedProducts.length > 0) {
      const isValidSale = selectedProducts.every(item => item.salePrice > 0);
      if (!isValidSale) {
        return;
      }

      const saleId = String(uuid.v4());
      const dateNow = new Date().toISOString();

      addSale({
        id: saleId,
        client: clientData,
        products: selectedProducts,
        total: totalValue,
        date: dateNow,
      });

      clearSaleData();
      onConfirm();
      navigation.navigate("openSales") 
    }
  };

  return (
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
        bg="rgba(0,0,0,0.6)"
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
            {isConfirmMode ? "Confirmar Venda" : "Detalhes da Venda"}
          </Text>

          {clientData && (
            <Box mb="$4" p="$3" bg="$backgroundDark800" borderRadius="$lg">
              <Text size="lg" color="$textLight0" fontFamily="$heading" mb="$2">
                Dados do Cliente
              </Text>
              <VStack space="sm">
                <Text color="$textLight200">Nome: {clientData.nameClient}</Text>
                <Text color="$textLight200">Tel: {clientData.phone}</Text>
                <Text color="$textLight200">Endereço: {clientData.address}</Text>
              </VStack>
            </Box>
          )}

          <Text size="lg" color="$textLight0" fontFamily="$heading" mb="$2">
            Peças Selecionadas ({selectedProducts.length})
          </Text>
          <Box height="45%" mb="$4">
            <FlatList
              data={selectedProducts}
              renderItem={renderProductItem}
              keyExtractor={(item) => item.id}
              showsVerticalScrollIndicator={true}
            />
          </Box>

          <Box 
            bg="$backgroundDark800" 
            p="$3" 
            borderRadius="$lg" 
            mb="$4"
          >
            <HStack justifyContent="space-between" alignItems="center">
              <Text color="$white" fontSize="$lg" fontFamily="$heading">
                Valor Total:
              </Text>
              <Text color="$green400" fontSize="$xl" fontFamily="$heading">
                R$ {totalValue.toFixed(2).replace(".", ",")}
              </Text>
            </HStack>
          </Box>

          <HStack justifyContent="space-between" mt="$2">
            <Button
              w="48%"
              bg="$red600"
              rounded="$xl"
              onPress={onClose}
            >
              <HStack alignItems="center" space="sm">
                <X color="white" size={20} />
                <Text color="$white" fontSize="$md" fontFamily="$heading">
                  {isConfirmMode ? "Cancelar" : "Fechar"}
                </Text>
              </HStack>
            </Button>
            
            {isConfirmMode && (
              <Button
                w="48%"
                bg="$green600"
                rounded="$xl"
                onPress={handleConfirm}
              >
                <HStack alignItems="center" space="sm">
                  <Check color="white" size={20} />
                  <Text color="$white" fontSize="$md" fontFamily="$heading">
                    Confirmar
                  </Text>
                </HStack>
              </Button>
            )}
          </HStack>
        </Box>
      </Box>
    </Modal>
  );
}
