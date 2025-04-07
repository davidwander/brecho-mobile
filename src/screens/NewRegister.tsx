import { useState } from 'react';
import { useRouter } from 'expo-router';

import { useProduct } from '@contexts/ProductContext';

import {
  Center, Text, VStack, HStack, Actionsheet, ActionsheetBackdrop, ActionsheetContent,
  Select, SelectTrigger, SelectInput, SelectIcon, SelectPortal, SelectBackdrop,
  SelectContent, SelectDragIndicatorWrapper, SelectItem, Box, ActionsheetItem
} from '@gluestack-ui/themed';
import {
  KeyboardAvoidingView, Platform, ScrollView, Keyboard, TouchableWithoutFeedback
} from 'react-native';

import { ClipboardList , ReceiptText, DollarSign, Calendar } from 'lucide-react-native';

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

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={{ flex: 1 }}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
    >
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <Center 
          flex={1} 
          bg="$textDark900" 
          pt="$10"
        >
          <ScrollView 
            contentContainerStyle={{ flexGrow: 1, justifyContent: 'center' }} style={{ width: '100%' }} 
            showsVerticalScrollIndicator={false}
          >
            <VStack 
              space="md" 
              w="90%" 
              alignSelf="center" 
              py="$4"
            >
              <Text 
                color="$white" 
                fontSize="$lg" 
                fontFamily="$heading" lineHeight="$xl"
              >
                Registrar Nova Peça
              </Text>

              <Select 
                onValueChange={setSelectedPiece} 
                selectedValue={selectedPiece}
              >
                <SelectTrigger 
                  bg="$gray500" 
                  borderRadius="$xl" 
                  height="$12" 
                  borderWidth="$1" 
                  borderColor="$coolGray500"
                  flexDirection="row" justifyContent="space-between" alignItems="center"
                >
                  <SelectInput 
                    placeholder="Escolha a peça" 
                    color="$white" 
                    fontSize="$md" 
                    fontFamily="$body" 
                  />
                  <SelectIcon color='$white' />
                </SelectTrigger>
                <SelectPortal>
                  <SelectBackdrop />
                  <SelectContent 
                    bg="$trueGray700" 
                    width="100%" 
                    borderRadius="$lg"
                  >
                    <SelectDragIndicatorWrapper />
                    {PIECES.map(p => (
                      <SelectItem key={p} value={p.toLowerCase()} label={p} bg="$gray600" sx={{ _text: { color: "$white" } }} />
                    ))}
                  </SelectContent>
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

              <Center mt="$4" gap="$2">
                <Button 
                  title="Calcular Preço de Venda" 
                  onPress={calculateSalePrice} 
                />
              </Center>

              <Center gap="$2">
                <Input 
                  placeholder="Preço de Venda" 
                  value={salePrice} 
                  editable={false} color="$white" 
                />
                <Input 
                  editable={false} 
                  value={`Registro: ${registerId.slice(0, 6)}`} 
                />
              </Center>

              <Button 
                title="Gerar Novo Registro" 
                onPress={handleRegisterAndGenerateNewId} 
              />
              <Button 
                title="Abrir Menu" 
                onPress={() => setIsOpen(true)} 
              />
            </VStack>
          </ScrollView>

          <Actionsheet isOpen={isOpen} onClose={() => setIsOpen(false)}>
            <ActionsheetBackdrop />
              <ActionsheetContent 
                bg="$trueGray600" 
                rounded="$2xl" 
                p="$8"
                maxHeight={300}
              >
                <HStack 
                  flexWrap="wrap" 
                  justifyContent="space-evenly"
                  alignItems="center"
                  gap="$2"
                >
                  <ActionsheetItem 
                    w={80}
                    h={80}
                    p="$2" 
                    justifyContent="center"
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
                    p="$2" 
                    justifyContent="center"
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
                    p="$2" 
                    justifyContent="center"
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
          </Actionsheet>
        </Center>
      </TouchableWithoutFeedback>
    </KeyboardAvoidingView>
  );
}
