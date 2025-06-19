import React, { useState } from 'react';
import { FlatList, TextInput } from 'react-native';
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
  Switch,
  useToast,
  Toast,
} from '@gluestack-ui/themed';
import { useSales, OpenSaleItem } from '@contexts/SalesContext';
import { SaleDetailsModal } from '@components/SaleDetailsModal';
import { CustomToast } from '@components/CustomToast';
import Feather from 'react-native-vector-icons/Feather';
import FontAwesome from 'react-native-vector-icons/FontAwesome';
import Ionicons from 'react-native-vector-icons/Ionicons';

export function OpenSales() {
  const { openSales, deleteSale, updateFreight } = useSales();
  const [selectedSale, setSelectedSale] = useState<OpenSaleItem | null>(null);
  const [isDetailsModalVisible, setIsDetailsModalVisible] = useState(false);
  const [isDeleteModalVisible, setIsDeleteModalVisible] = useState(false);
  const [isFreightModalVisible, setIsFreightModalVisible] = useState(false);
  const [saleToDelete, setSaleToDelete] = useState<string | null>(null);
  const [saleToEditFreight, setSaleToEditFreight] = useState<string | null>(null);
  const [freightValue, setFreightValue] = useState('');
  const [isFreightPaid, setIsFreightPaid] = useState(false);
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const toast = useToast();

  const handleOpenDetails = (sale: OpenSaleItem) => {
    setSelectedSale(sale);
    setIsDetailsModalVisible(true);
  };

  const handleOpenDeleteModal = (saleId: string) => {
    setSaleToDelete(saleId);
    setIsDeleteModalVisible(true);
  };

  const handleOpenFreightModal = (sale: OpenSaleItem) => {
    setSaleToEditFreight(sale.id);
    setFreightValue(sale.freightValue ? sale.freightValue.toFixed(2).replace('.', ',') : '');
    setIsFreightPaid(sale.isFreightPaid || false);
    setIsFreightModalVisible(true);
  };

  const handleConfirmDelete = () => {
    if (!saleToDelete) return;

    try {
      deleteSale(saleToDelete);
      setIsDeleteModalVisible(false);
      setSaleToDelete(null);
      toast.show({
        placement: "bottom",
        duration: 3000,
        render: () => (
          <Toast action="success" variant="solid" bg="$green600" borderRadius="$md" padding="$3" marginBottom="$6">
            <Text color="$white" fontSize="$sm" fontWeight="$medium">
              Venda excluída com sucesso!
            </Text>
          </Toast>
        ),
      });
    } catch (error) {
      console.error('Erro ao excluir venda:', error);
      setIsDeleteModalVisible(false);
      setSaleToDelete(null);
      toast.show({
        placement: "bottom",
        duration: 3000,
        render: () => (
          <Toast action="error" variant="solid" bg="$red600" borderRadius="$md" padding="$3" marginBottom="$6">
            <Text color="$white" fontSize="$sm" fontWeight="$medium">
              Erro ao excluir a venda!
            </Text>
          </Toast>
        ),
      });
    }
  };

  const handleConfirmFreight = () => {
    if (!saleToEditFreight) return;

    try {
      const numericFreight = parseFloat(freightValue.replace(',', '.'));
      if (isNaN(numericFreight) || numericFreight < 0) {
        throw new Error('Valor do frete inválido');
      }

      updateFreight(saleToEditFreight, numericFreight, isFreightPaid);
      setIsFreightModalVisible(false);
      setSaleToEditFreight(null);
      setFreightValue('');
      setIsFreightPaid(false);
      toast.show({
        placement: "bottom",
        duration: 3000,
        render: () => (
          <Toast action="success" variant="solid" bg="$green600" borderRadius="$xl" padding="$4" marginBottom="$16">
            <Text 
              color="$white" 
              fontSize="$sm" 
              fontWeight="$medium" 
              lineHeight="$sm"
            >
              Frete atualizado com sucesso!
            </Text>
          </Toast>
        ),
      });
    } catch (error) {
      console.error('Erro ao atualizar frete:', error);
      setIsFreightModalVisible(false);
      setSaleToEditFreight(null);
      setFreightValue('');
      setIsFreightPaid(false);
      toast.show({
        placement: "bottom",
        duration: 3000,
        render: () => (
          <Toast action="error" variant="solid" bg="$red600" borderRadius="$md" padding="$3" marginBottom="$6">
            <Text color="$white" fontSize="$sm" fontWeight="$medium">
              Erro ao atualizar o frete!
            </Text>
          </Toast>
        ),
      });
    }
  };

  const handleFreightValueChange = (text: string) => {
    const numeric = text.replace(/[^0-9,]/g, "").replace(",", ".");
    setFreightValue(numeric);
  };

  const handleFreightValueBlur = () => {
    if (freightValue) {
      const formatted = parseFloat(freightValue)
        .toFixed(2)
        .replace(".", ",");
      setFreightValue(formatted);
    } else {
      setFreightValue('');
    }
  };

  const renderSaleCard = ({ item }: { item: OpenSaleItem }) => {
    const itemCount = item.selectedProducts.reduce((sum, product) => sum + (product.quantity || 1), 0);
    const freightValue = item.freightValue || 0;
    const totalWithFreight = item.total + freightValue;

    return (
      <Box
        mb="$5"
        p="$5"
        bg="$backgroundDark800"
        borderRadius="$3xl"
        position="relative"
        overflow="hidden"
        style={{
          elevation: 10,
          shadowColor: "#000",
          shadowOffset: { width: 0, height: 4 },
          shadowOpacity: 0.15,
          shadowRadius: 12,
        }}
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
          <VStack justifyContent="space-between" alignItems="flex-start">
            <HStack space="sm" alignItems="center">
              <Feather name="user" size={20} color="#a78bfa" />
              <Text 
                size="lg" 
                color="$textLight0" 
                fontFamily="$heading"
              >
                {item.clientData.nameClient || 'Cliente desconhecido'}
              </Text>
            </HStack>

            <HStack gap="2" py="$2" justifyContent="space-evenly">
              <GluestackButton
                size="sm"
                bg="$purple700"
                rounded="$xl"
                onPress={() => handleOpenDetails(item)}
                accessibilityLabel={`Ver detalhes da venda de ${item.clientData.nameClient || 'cliente desconhecido'}`}
              >
                <HStack alignItems="center" space="xs" px="$2">
                  <FontAwesome name="eye" color="white" size={16} />
                  <Text color="$white" fontSize="$sm" lineHeight="$sm">
                    Detalhes
                  </Text>
                </HStack>
              </GluestackButton>

              <GluestackButton
                size="sm"
                bg="$cyan600"
                rounded="$xl"
                onPress={() => handleOpenFreightModal(item)}
                accessibilityLabel={`Editar frete da venda de ${item.clientData.nameClient || 'cliente desconhecido'}`}
              >
                <HStack alignItems="center" space="xs" px="$2">
                  <Ionicons name="car" color="white" size={16} />
                  <Text color="$white" fontSize="$sm" lineHeight="$sm">
                    Frete
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
                  <Text color="$white" fontSize="$sm" lineHeight="$sm">
                    Excluir
                  </Text>
                </HStack>
              </GluestackButton>
            </HStack>
          </VStack>

          <Divider bg="$trueGray500" />

          <VStack space="sm">
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
                  R$ {item.total.toFixed(2).replace('.', ',')}
                </Text>
              </HStack>
            </HStack>

            <HStack justifyContent="space-between">
              <HStack space="sm" alignItems="center">
                <Ionicons name="car" color="#60a5fa" size={20} />
                <Text color="$textLight200">
                  Frete: R$ {freightValue.toFixed(2).replace('.', ',')}
                </Text>
              </HStack>

              <HStack space="sm" alignItems="center">
                <Feather name={item.isFreightPaid ? "check-circle" : "x-circle"} color={item.isFreightPaid ? "#34d399" : "#ef4444"} size={20} />
                <Text color={item.isFreightPaid ? "$green400" : "$red400"} fontFamily="$heading" size="sm">
                  {item.isFreightPaid ? 'Frete Pago' : 'Frete Não Pago'}
                </Text>
              </HStack>
            </HStack>

            <Divider bg="$trueGray500" />

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
          onConfirm={() => {}} 
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
          <ModalHeader alignSelf="center">
            <Text fontFamily="$heading" fontSize="$lg" color="$white" lineHeight="$md">
              Confirmar Exclusão
            </Text>
          </ModalHeader>
          <ModalBody>
            <Text color="$textLight200" fontSize="$md" textAlign="center">
              Tem certeza que deseja excluir esta venda? Essa ação não pode be desfeita.
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

      <Modal
        isOpen={isFreightModalVisible}
        onClose={() => {
          setIsFreightModalVisible(false);
          setSaleToEditFreight(null);
          setFreightValue('');
          setIsFreightPaid(false);
        }}
      >
        <ModalBackdrop />
        <ModalContent bg="$backgroundDark800" borderRadius="$2xl" p="$6" width="80%">
          <ModalHeader alignSelf="center">
            <Text fontFamily="$heading" fontSize="$lg" color="$white" lineHeight="$md">
              Editar Frete
            </Text>
          </ModalHeader>
          <ModalBody>
            <VStack space="md" >
              <Text color="$textLight200" fontSize="$md">
                Valor do Frete
              </Text>
              <TextInput
                style={{
                  backgroundColor: '#27272a',
                  color: '#ffffff',
                  padding: 12,
                  borderRadius: 8,
                  borderWidth: 1,
                  borderColor: '#3f3f46',
                }}
                placeholder="R$ 0,00"
                value={freightValue}
                onChangeText={handleFreightValueChange}
                onBlur={handleFreightValueBlur}
                keyboardType="numeric"
                placeholderTextColor="#71717a"
              />
              <HStack justifyContent="space-between" alignItems="center">
                <Text color="$textLight200" fontSize="$md" lineHeight="$sm">
                  Frete Pago?
                </Text>
                <Switch
                  value={isFreightPaid}
                  onValueChange={setIsFreightPaid}
                  trackColor={{ false: "$trueGray600", true: "$purple600" }}
                />
              </HStack>
            </VStack>
          </ModalBody>
          <ModalFooter>
            <HStack space="md" width="100%" justifyContent="space-between">
              <GluestackButton
                flex={1}
                variant="outline"
                borderColor="$trueGray600"
                rounded="$lg"
                onPress={() => {
                  setIsFreightModalVisible(false);
                  setSaleToEditFreight(null);
                  setFreightValue('');
                  setIsFreightPaid(false);
                }}
              >
                <Text color="$white" lineHeight="$sm">Cancelar</Text>
              </GluestackButton>
              <GluestackButton
                flex={1}
                bg="$green600"
                rounded="$lg"
                onPress={handleConfirmFreight}
              >
                <Text color="$white" lineHeight="$sm">Confirmar</Text>
              </GluestackButton>
            </HStack>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </Box>
  );
}