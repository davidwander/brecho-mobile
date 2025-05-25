import React, { useState } from 'react';
import { FlatList, TouchableOpacity } from 'react-native';
import { Box, Center, Text, VStack, HStack, Divider, Button as GluestackButton, Modal, ModalBackdrop, ModalContent, ModalHeader, ModalBody, ModalFooter, useToast, Toast } from '@gluestack-ui/themed';

import { useSales, OpenSaleItem } from '@contexts/SalesContext';
import Feather from 'react-native-vector-icons/Feather';
import { Calendar, LocaleConfig } from 'react-native-calendars';
import BackButton from '@components/BackButton';
import Ionicons from 'react-native-vector-icons/Ionicons';
import Entypo from 'react-native-vector-icons/Entypo';

import { ptBR } from '../utils/localeCalendarConfig'

LocaleConfig.locales['pt-BR'] = ptBR;
LocaleConfig.defaultLocale = 'pt-BR';

export function Shipments() {
  const { openSales, updateDeliveryDate } = useSales();
  const [selectedSaleId, setSelectedSaleId] = useState<string | null>(null);
  const [isCalendarModalVisible, setIsCalendarModalVisible] = useState(false);
  const [selectedDate, setSelectedDate] = useState<string>('');
  const toast = useToast();

  const availableShipments = openSales.filter(
    (sale) => sale.isPaid && sale.isFreightPaid
  );

  const handleOpenCalendarModal = (saleId: string) => {
    setSelectedSaleId(saleId);
    setSelectedDate('');
    setIsCalendarModalVisible(true);
  };

  const handleDateSelect = (day: { dateString: string }) => {
    setSelectedDate(day.dateString);
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

  const renderShipmentCard = ({ item }: { item: OpenSaleItem }) => {
    const totalValue = item.selectedProducts.reduce(
      (total, product) => total + product.salePrice,
      0
    );
    const itemCount = item.selectedProducts.length;
    const freightValue = item.freightValue || 0;
    const totalWithFreight = totalValue + freightValue;

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
                  size="md" lineHeight="$sm"
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
                  Entrega: {item.deliveryDate ? new Date(item.deliveryDate).toLocaleDateString('pt-BR') : 'Não agendada'}
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
                arrowStyle:{
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
    </Box>
  );
}