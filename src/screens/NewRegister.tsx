import { useState } from 'react';
import { useRouter } from 'expo-router';

import { useProduct } from '@contexts/ProductContext';

import {
  Text, VStack, HStack, Actionsheet, ActionsheetBackdrop, ActionsheetContent,
  Select, SelectTrigger, SelectInput, SelectPortal, SelectBackdrop,
  SelectContent, SelectDragIndicatorWrapper, SelectItem, Box, ActionsheetItem
} from '@gluestack-ui/themed';

import {
  KeyboardAvoidingView, Platform, ScrollView, Keyboard, TouchableWithoutFeedback, View
} from 'react-native';

import { ClipboardList , DollarSign, Calendar } from 'lucide-react-native';

import { Input } from '@components/Input';
import { Button } from '@components/Button';

const generateRegisterId = () => Math.floor(100000 + Math.random() * 900000).toString();

const PIECES = [
  'Blusa', 'Camisa', 'Camiseta', 'T-Shirt', 'Top', 'Saia', 'Short',
  'Calça', 'Vestido', 'Calçados', 'Acessórios'
];

export function NewRegister() {
  const [name, setName] = useState('');
  const [registerId, setRegisterId] = useState(generateRegisterId()); 
  const [selectedPiece, setSelectedPiece] = useState('');
  const [description, setDescription] = useState('');
  const [rawCostPrice, setRawCostPrice] = useState('');
  const [costPrice, setCostPrice] = useState('');
  const [rawProfitMargin, setRawProfitMargin] = useState('');
  const [profitMargin, setProfitMargin] = useState('');
  const [salePrice, setSalePrice] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const router = useRouter();
  const { addProduct } = useProduct();
  const [dropdownReady, setDropdownReady] = useState(false);
  const [sheetReady, setSheetReady] = useState(false);

  const handleRegisterAndGenerateNewId = () => {
    if (!selectedPiece || !description || !rawCostPrice || !rawProfitMargin) return;

    const cost = parseFloat(rawCostPrice);
    const margin = parseFloat(rawProfitMargin);
    const sale = cost + (cost * (margin / 100));

    const product = {
      id: registerId,
      name,
      type: selectedPiece,
      description,
      costPrice: cost,
      profitMargin: margin,
      salePrice: sale,
    };

    addProduct(product);
    setRegisterId(generateRegisterId()); 
    setSelectedPiece('');
    setDescription('');
    setRawCostPrice('');
    setCostPrice('');
    setRawProfitMargin('');
    setProfitMargin('');
    setSalePrice('');
  };

  const handleProfitMarginChange = (text: string) => {
    const numeric = text.replace(/[^0-9]/g, '');
    setRawProfitMargin(numeric);
    setProfitMargin(text);
  };

  const handleProfitMarginBlur = () => {
    if (rawProfitMargin) setProfitMargin(`${rawProfitMargin}%`);
    else setProfitMargin('');
  };

  const handleCostPriceChange = (text: string) => {
    let numeric = text.replace(/[^0-9,]/g, '').replace(',', '.');
    setRawCostPrice(numeric);
    setCostPrice(text);
  };

  const handleCostPriceBlur = () => {
    if (rawCostPrice) {
      const formatted = `R$ ${parseFloat(rawCostPrice).toFixed(2).replace('.', ',')}`;
      setCostPrice(formatted);
    } else setCostPrice('');
    calculateSalePrice();
  };

  const calculateSalePrice = () => {
    const cost = parseFloat(rawCostPrice);
    const margin = parseFloat(rawProfitMargin);
    if (!isNaN(cost) && !isNaN(margin)) {
      const sale = cost + (cost * (margin / 100));
      setSalePrice(`R$ ${sale.toFixed(2).replace('.', ',')}`);
    }
  };

  const handleOpenDropdown = () => {
    setDropdownReady(false);
    setTimeout(() => setDropdownReady(true), 50);
  };

  const openSheet = () => {
    setSheetReady(false);
    setIsOpen(true);
    setTimeout(() => setSheetReady(true), 50);
  };

  const closeSheet = () => {
    setIsOpen(false);
    setSheetReady(false);
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <View style={{ flex: 1, backgroundColor: '#121214' }}>
          <ScrollView
            contentContainerStyle={{
              flexGrow: 1,
              justifyContent: 'center',
              paddingVertical: 40,
              paddingHorizontal: 20,
            }}
            showsVerticalScrollIndicator={false}
          >
            <VStack space="md">
              <Text 
                color="$white" 
                fontSize="$lg" 
                fontFamily="$heading" 
                lineHeight="$xl"
              >
                Registrar Nova Peça
              </Text>

              <Select
                selectedValue={selectedPiece}
                onValueChange={setSelectedPiece}
                onOpen={handleOpenDropdown}
              >
                <SelectTrigger 
                  variant="outline" 
                  size="md"
                  h="$12"
                  rounded="$lg"
                >
                  <SelectInput
                    placeholder="Escolha a peça"
                    color="$white"
                  />
                </SelectTrigger>
                <SelectPortal>
                  <SelectBackdrop />
                  {dropdownReady && (
                    <SelectContent
                      bg="$trueGray700"
                      width="100%"
                      borderRadius="$lg"
                    >
                      <SelectDragIndicatorWrapper />
                      {PIECES.map((p) => (
                        <SelectItem
                          key={p}
                          value={p.toLowerCase()}
                          label={p}
                          bg="$gray600"
                          sx={{ _text: { color: "$white" } }}
                        />
                      ))}
                    </SelectContent>
                  )}
                </SelectPortal>
              </Select>

              <Input 
                placeholder="Descrição" 
                value={description} 
                onChangeText={setDescription} 
              />

              <Input 
                placeholder="Preço de Custo" 
                value={costPrice} 
                onChangeText={handleCostPriceChange} 
                onBlur={handleCostPriceBlur} 
                keyboardType="numeric" 
              />

              <Input 
                placeholder="Margem de Lucro (%)" 
                value={profitMargin} 
                keyboardType="numeric" 
                onChangeText={handleProfitMarginChange} 
                onBlur={handleProfitMarginBlur} 
              />

              <Button 
                title="Calcular Preço de Venda" 
                onPress={calculateSalePrice} 
              />

              <Input 
                placeholder="Preço de Venda" 
                value={salePrice} 
                editable={false} 
                color="$white" 
              />
              <Input 
                editable={false} 
                value={`Cod: ${registerId.slice(0, 6)}`} 
              />

              <Button 
                title="Gerar Novo Registro" 
                onPress={handleRegisterAndGenerateNewId} 
              />
              <Button 
                title="Abrir Menu" 
                onPress={openSheet} 
                variant="outline"
              />
            </VStack>
          </ScrollView>

          <Actionsheet 
            isOpen={isOpen}
            onClose={closeSheet}
          >
            <ActionsheetBackdrop />
            {sheetReady && (
              <ActionsheetContent 
                bg="$trueGray600" 
                rounded="$2xl" 
                p="$8"
                minHeight={150}
              >
                <HStack 
                  flexWrap="wrap" 
                  justifyContent="space-evenly"
                  alignItems="center"
                  gap="$2"
                  opacity={sheetReady ? 1 : 0}
                  pointerEvents={sheetReady ? 'auto' : 'none'}
                >
                  <ActionsheetItem 
                    w={80} 
                    h={80} 
                    p="$2" justifyContent="center"
                  >
                    <Box 
                      borderWidth={1}
                      borderColor="$purple500"
                      w={80}
                      h={80}
                      rounded="$xl"
                      alignItems="center"
                      justifyContent="center"
                    >
                      <ClipboardList color="#fff" size={36} />
                    </Box>
                  </ActionsheetItem>
                  <ActionsheetItem 
                    w={80} 
                    h={80} 
                    p="$2" justifyContent="center"
                  >
                    <Box 
                      borderWidth={1}
                      borderColor="$purple500"
                      w={80}
                      h={80}
                      rounded="$xl"
                      alignItems="center"
                      justifyContent="center"
                    >
                      <DollarSign color="#fff" size={36} />
                    </Box>
                  </ActionsheetItem>
                  <ActionsheetItem 
                    w={80} 
                    h={80} 
                    p="$2" justifyContent="center"
                  >
                    <Box 
                      borderWidth={1}
                      borderColor="$purple500"
                      w={80}
                      h={80}
                      rounded="$xl"
                      alignItems="center"
                      justifyContent="center"
                    >
                      <Calendar color="#fff" size={36} />
                    </Box>
                  </ActionsheetItem>
                </HStack>
              </ActionsheetContent>
            )}
          </Actionsheet>
        </View>
      </TouchableWithoutFeedback>
    </KeyboardAvoidingView>
  );
}
