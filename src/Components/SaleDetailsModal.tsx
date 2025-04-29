import React, { useMemo } from 'react';
import { Modal, FlatList } from 'react-native';
import { Box, Text, Button, HStack, VStack, Divider } from '@gluestack-ui/themed';
import { Check, X, Tag, DollarSign } from 'lucide-react-native';
import { ClientData, ProductItem } from '@contexts/SalesContext'; // Importando os tipos do contexto de vendas

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
  // Calcular o valor total da venda
  const totalValue = useMemo(() => {
    return selectedProducts.reduce((total, product) => total + product.salePrice, 0);
  }, [selectedProducts]);

  // Renderizar cada item de produto
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

          {/* Dados do Cliente */}
          {clientData && (
            <Box mb="$4" p="$3" bg="$backgroundDark800" borderRadius="$lg">
              <Text size="lg" color="$textLight0" fontFamily="$heading" mb="$2">
                Dados do Cliente
              </Text>
              <VStack space="sm">
                <Text color="$textLight200">Nome: {clientData.nameClient}</Text>
                <Text color="$textLight200">CPF: {clientData.cpf}</Text>
                <Text color="$textLight200">Endereço: {clientData.address}</Text>
              </VStack>
            </Box>
          )}

          {/* Lista de Produtos */}
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

          {/* Valor Total */}
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

          {/* Botões */}
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
                onPress={onConfirm}
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
