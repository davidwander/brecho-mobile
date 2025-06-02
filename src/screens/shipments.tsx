import React, { useState } from 'react';
import { FlatList, TouchableOpacity } from 'react-native';
import { Box, Center, Text, VStack, HStack, Divider, Button as GluestackButton, Modal, ModalBackdrop, ModalContent, ModalHeader, ModalBody, ModalFooter, useToast, Toast } from '@gluestack-ui/themed';
import { useSales, OpenSaleItem } from '@contexts/SalesContext';
import { useDelivery } from '@contexts/DeliveryContext';
import Feather from 'react-native-vector-icons/Feather';
import { Calendar, LocaleConfig } from 'react-native-calendars';
import BackButton from '@components/BackButton';
import Ionicons from 'react-native-vector-icons/Ionicons';
import Entypo from 'react-native-vector-icons/Entypo';
import { ptBR } from '../utils/localeCalendarConfig';

LocaleConfig.locales['pt-BR'] = ptBR;
LocaleConfig.defaultLocale = 'pt-BR';

const formatDateToLocal = (dateString: string): string => {
  const [year, month, day] = dateString.split('-').map(Number);
  const date = new Date(year, month - 1, day); 
  return date.toLocaleDateString('pt-BR'); 
};

const parseLocalDate = (dateString: string): string => {
  const [year, month, day] = dateString.split('-').map(Number);
  return new Date(year, month - 1, day).toISOString().split('T')[0]; 
};

export function Shipments() {
  const { shipments } = useSales();
  const { updateDeliveryDate, confirmShipment, pendingDeliveries } = useDelivery();
  const [selectedSaleId, setSelectedSaleId] = useState<string | null>(null);
  const [isCalendarModalVisible, setIsCalendarModalVisible] = useState(false);
  const [isConfirmModalVisible, setIsConfirmModalVisible] = useState(false);
  const [selectedDate, setSelectedDate] = useState<string>('');
  const toast = useToast();

  const availableShipments = pendingDeliveries;

  const handleOpenCalendarModal = (saleId: string) => {
    setSelectedSaleId(saleId);
    setSelectedDate('');
    setIsCalendarModalVisible(true);
  };

  const handleOpenConfirmModal = (saleId: string) => {
    setSelectedSaleId(saleId);
    setIsConfirmModalVisible(true);
  };

  const handleDateSelect = (day: { dateString: string }) => {
    setSelectedDate(parseLocalDate(day.dateString));
  };

  const handleConfirmDeliveryDate = () => {
    if (!selectedSaleId || !selectedDate) return;

    try {
      updateDeliveryDate(selectedSaleId, selectedDate); 
      setIsCalendarModalVisible(false);
      setSelectedSaleId(null);
      setSelectedDate('');
      toast.show({
        placement: 'bottom',
        duration: 3000,
        render: () => (
          <Toast action="success" variant="solid" bg="$green600" borderRadius="$xl" padding="$3" marginBottom="$16">
            <Text color="$white" fontSize="$sm" fontWeight="$medium">
              Data de entrega atualizada com sucesso!
            </Text>
          </Toast>
        ),
      });
    } catch (error) {
      console.error('Erro ao atualizar data de entrega:', error);
      setIsCalendarModalVisible(false);
      setSelectedSaleId(null);
      setSelectedDate('');
      toast.show({
        placement: 'bottom',
        duration: 3000,
        render: () => (
          <Toast action="error" variant="solid" bg="$red600" borderRadius="$md" padding="$3" marginBottom="$6">
            <Text color="$white" fontSize="$sm" fontWeight="$medium">
              Erro ao atualizar a data de entrega!
            </Text>
          </Toast>
        ),
      });
    }
  };

  const handleConfirmShipment = () => {
    if (!selectedSaleId) return;

    try {
      // Assumindo que você tem uma função confirmShipment no contexto
      // que marca a venda como enviada
      confirmShipment(selectedSaleId);
      setIsConfirmModalVisible(false);
      setSelectedSaleId(null);
      toast.show({
        placement: 'bottom',
        duration: 3000,
        render: () => (
          <Toast action="success" variant="solid" bg="$blue600" borderRadius="$xl" padding="$3" marginBottom="$16">
            <Text color="$white" fontSize="$sm" fontWeight="$medium">
              Venda confirmada como enviada!
            </Text>
          </Toast>
        ),
      });
    } catch (error) {
      console.error('Erro ao confirmar envio:', error);
      setIsConfirmModalVisible(false);
      setSelectedSaleId(null);
      toast.show({
        placement: 'bottom',
        duration: 3000,
        render: () => (
          <Toast action="error" variant="solid" bg="$red600" borderRadius="$md" padding="$3" marginBottom="$6">
            <Text color="$white" fontSize="$sm" fontWeight="$medium">
              Erro ao confirmar o envio!
            </Text>
          </Toast>
        ),
      });
    }
  };

  const renderShipmentCard = ({ item }: { item: OpenSaleItem }) => {
    const totalValue = item.selectedProducts.reduce(
      (total, product) => total + product.salePrice,
      0
    );
    const itemCount = item.selectedProducts.length;
    const freightValue = item.freightValue || 0;
    const totalWithFreight = totalValue + freightValue;
    const hasDeliveryDate = !!item.deliveryDate;

    return (
      <Box
        mb="$5"
        p="$5"
        bg="$backgroundDark800"
        borderRadius="$3xl"
        borderWidth={1}
        borderColor="$trueGray700"
        shadowColor="black"
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
          bg="$green600"
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
              <TouchableOpacity
                onPress={() => handleOpenCalendarModal(item.id)}
                accessibilityLabel={`Agendar entrega para ${item.clientData.nameClient || 'cliente desconhecido'}`}
                style={{
                  width: 32,
                  height: 32,
                  backgroundColor: '#7c3aed',
                  borderRadius: 8,
                  justifyContent: 'center',
                  alignItems: 'center',
                }}
              >
                <Feather name="calendar" size={22} color="#ffffff" />
              </TouchableOpacity>

              {hasDeliveryDate && (
                <TouchableOpacity
                  onPress={() => handleOpenConfirmModal(item.id)}
                  accessibilityLabel={`Confirmar envio para ${item.clientData.nameClient || 'cliente desconhecido'}`}
                  style={{
                    width: 32,
                    height: 32,
                    backgroundColor: '#059669',
                    borderRadius: 8,
                    justifyContent: 'center',
                    alignItems: 'center',
                  }}
                >
                  <Feather name="truck" size={22} color="#ffffff" />
                </TouchableOpacity>
              )}
            </HStack>
          </HStack>

          <Divider bg="$trueGray600" />

          <VStack space="sm">
            <HStack justifyContent="space-between" mt="$2">
              <HStack space="sm" alignItems="center">
                <Feather name="shopping-bag" color="#60a5fa" size={20} />
                <Text color="$textLight200" lineHeight="$sm">
                  {itemCount} {itemCount === 1 ? 'item' : 'itens'}
                </Text>
              </HStack>

              <HStack space="sm" alignItems="center">
                <Entypo name="price-tag" color="#34d399" size={20} />
                <Text 
                  color="$green400" 
                  fontFamily="$heading" 
                  size="md" 
                  lineHeight="$sm"
                >
                  R$ {totalValue.toFixed(2).replace('.', ',')}
                </Text>
              </HStack>
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
                  Entrega: {item.deliveryDate ? formatDateToLocal(item.deliveryDate) : 'Não agendada'}
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

            {hasDeliveryDate && (
              <Box mt="$3" pt="$3" borderTopWidth={1} borderTopColor="$trueGray600">
                <GluestackButton
                  bg="$green600"
                  rounded="$lg"
                  onPress={() => handleOpenConfirmModal(item.id)}
                  width="100%"
                >
                  <HStack space="sm" alignItems="center">
                    <Feather name="truck" size={18} color="#ffffff" />
                    <Text color="$white" fontWeight="$medium">
                      Confirmar Saída para Entrega
                    </Text>
                  </HStack>
                </GluestackButton>
              </Box>
            )}
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
          Vendas para Envio
        </Text>
      </Center>

      <FlatList
        showsVerticalScrollIndicator={false}
        data={availableShipments}
        keyExtractor={(item) => item.id}
        renderItem={renderShipmentCard}
        contentContainerStyle={{ paddingBottom: 24, flexGrow: 1 }}
        ListEmptyComponent={() => (
          <Center mt="$10" flex={1}>
            <Text color="$textLight400" lineHeight="$md">
              Nenhuma venda disponível para envio.
            </Text>
          </Center>
        )}
      />

      {/* Modal do Calendário */}
      <Modal
        isOpen={isCalendarModalVisible}
        onClose={() => {
          setIsCalendarModalVisible(false);
          setSelectedSaleId(null);
          setSelectedDate('');
        }}
      >
        <ModalBackdrop />
        <ModalContent 
          bg="$backgroundDark800" 
          borderRadius="$3xl" 
          p="$6" 
          width="100%"
        >
          <ModalHeader alignSelf="center">
            <Text 
              fontFamily="$heading" 
              fontSize="$xl" 
              color="$white" 
              lineHeight="$md"
            >
              Selecionar Data de Entrega
            </Text>
          </ModalHeader>
          <ModalBody>
            <Calendar
              headerStyle={{ 
                borderBottomWidth: 0.5, 
                borderColor: '#e8e8e8', 
                paddingBottom: 10,
                marginBottom: 10,
              }} 
              renderArrow={(direction: "right" | "left") => {
                return (
                  <Ionicons
                    name={direction === 'left' ? 'chevron-back' : 'chevron-forward'}
                    size={24}
                    color="#a78bfa"
                  />
                );
              }}
              onDayPress={handleDateSelect}
              markedDates={{
                [selectedDate]: { selected: true, selectedColor: '#7c3aed' },
              }}
              theme={{
                backgroundColor: 'transparent',
                calendarBackground: 'transparent',
                textMonthFontSize: 20,
                textSectionTitleColor: '#e5e7eb',
                selectedDayBackgroundColor: '#2563eb',
                selectedDayTextColor: '#ffffff',
                todayTextColor: '#34d399',
                dayTextColor: '#e5e7eb',
                textDisabledColor: '#717171',
                arrowColor: '#a78bfa',
                monthTextColor: '#e5e7eb',
                arrowStyle: {
                  margin: 0, 
                  padding: 0,
                }
              }}
              minDate={new Date().toISOString().split('T')[0]}
              hideExtraDays={true}
            />
          </ModalBody>
          <ModalFooter>
            <HStack space="md" width="100%" justifyContent="space-between">
              <GluestackButton
                flex={1}
                variant="outline"
                borderColor="$trueGray600"
                rounded="$lg"
                onPress={() => {
                  setIsCalendarModalVisible(false);
                  setSelectedSaleId(null);
                  setSelectedDate('');
                }}
              >
                <Text color="$white" lineHeight="$sm">Cancelar</Text>
              </GluestackButton>
              <GluestackButton
                flex={1}
                bg="$green600"
                rounded="$lg"
                onPress={handleConfirmDeliveryDate}
                isDisabled={!selectedDate}
              >
                <Text color="$white" lineHeight="$sm">Confirmar</Text>
              </GluestackButton>
            </HStack>
          </ModalFooter>
        </ModalContent>
      </Modal>

      {/* Modal de Confirmação de Envio */}
      <Modal
        isOpen={isConfirmModalVisible}
        onClose={() => {
          setIsConfirmModalVisible(false);
          setSelectedSaleId(null);
        }}
      >
        <ModalBackdrop />
        <ModalContent 
          bg="$backgroundDark800" 
          borderRadius="$3xl" 
          p="$6" 
          width="90%"
        >
          <ModalHeader alignSelf="center">
            <HStack space="sm" alignItems="center">
              <Feather name="truck" size={24} color="#34d399" />
              <Text 
                fontFamily="$heading" 
                fontSize="$xl" 
                color="$white" 
                lineHeight="$md"
              >
                Confirmar Envio
              </Text>
            </HStack>
          </ModalHeader>
          <ModalBody>
            <Center>
              <Text 
                color="$textLight200" 
                fontSize="$md" 
                textAlign="center"
                lineHeight="$md"
              >
                Tem certeza que deseja confirmar que esta venda saiu para entrega?
              </Text>
              <Text 
                color="$textLight400" 
                fontSize="$sm" 
                textAlign="center"
                mt="$2"
                lineHeight="$sm"
              >
                Esta ação não poderá ser desfeita.
              </Text>
            </Center>
          </ModalBody>
          <ModalFooter>
            <HStack space="md" width="100%" justifyContent="space-between">
              <GluestackButton
                flex={1}
                variant="outline"
                borderColor="$trueGray600"
                rounded="$lg"
                onPress={() => {
                  setIsConfirmModalVisible(false);
                  setSelectedSaleId(null);
                }}
              >
                <Text color="$white" lineHeight="$sm">Cancelar</Text>
              </GluestackButton>
              <GluestackButton
                flex={1}
                bg="$green600"
                rounded="$lg"
                onPress={handleConfirmShipment}
              >
                <HStack space="sm" alignItems="center">
                  <Feather name="check" size={16} color="#ffffff" />
                  <Text color="$white" lineHeight="$sm">Confirmar</Text>
                </HStack>
              </GluestackButton>
            </HStack>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </Box>
  );
}