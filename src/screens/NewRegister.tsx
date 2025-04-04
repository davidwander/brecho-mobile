import { useState } from 'react';
import { useRouter } from 'expo-router';

import { 
  Center, 
  Text, 
  VStack, 
  Actionsheet, 
  ActionsheetBackdrop, 
  ActionsheetContent,
  Select, 
  SelectTrigger, 
  SelectInput, 
  SelectIcon, 
  SelectPortal, 
  SelectBackdrop, 
  SelectContent, 
  SelectDragIndicator, 
  SelectDragIndicatorWrapper, 
  SelectItem
} from '@gluestack-ui/themed';

import { 
  KeyboardAvoidingView, 
  Platform, 
  ScrollView, 
  Keyboard, 
  TouchableWithoutFeedback
} from 'react-native';

import { Input } from '@components/Input';
import { Button } from '@components/Button';

const generateRegisterId = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

export function NewRegister() {
  const [name, setName] = useState('');
  const [registerId, setRegisterId] = useState(generateRegisterId()); 
  const [selectedPiece, setSelectedPiece] = useState('');

  const handleGenerateNewRegisterId = () => {
    setRegisterId(generateRegisterId());
  };

  const [rawCostPrice, setRawCostPrice] = useState('');
  const [costPrice, setCostPrice] = useState('');
  const [rawProfitMargin, setRawProfitMargin] = useState('');
  const [profitMargin, setProfitMargin] = useState('');
  const [salePrice, setSalePrice] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const router = useRouter();

  const handleProfitMarginChange = (text: string) => {
    let numericValue = text.replace(/[^0-9]/g, "");
    setRawProfitMargin(numericValue); 
    setProfitMargin(text); 
  };

  const handleProfitMarginBlur = () => {
    if (rawProfitMargin) {
      setProfitMargin(`${rawProfitMargin}%`);
    } else {
      setProfitMargin('');
    }
  };

  const handleCostPriceChange = (text: string) => {
    let numericValue = text.replace(/[^0-9,]/g, "");
    numericValue = numericValue.replace(",", ".");
    setRawCostPrice(numericValue); 
    setCostPrice(text); 
  };

  const handleCostPriceBlur = () => {
    if (rawCostPrice) {
      const formattedValue = `R$ ${parseFloat(rawCostPrice).toFixed(2).replace(".", ",")}`;
      setCostPrice(formattedValue);
    } else {
      setCostPrice('');
    }
    calculateSalePrice();
  };

  const calculateSalePrice = () => {
    const cost = parseFloat(rawCostPrice);
    const margin = parseFloat(profitMargin);
    if (!isNaN(cost) && !isNaN(margin)) {
      const sale = cost + (cost * (margin / 100));
      setSalePrice(`R$ ${sale.toFixed(2).replace(".", ",")}`);
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={{ flex: 1 }}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
    >
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <Center flex={1} bg="$textDark900" pt="$10">
          <ScrollView
            contentContainerStyle={{ flexGrow: 1, justifyContent: 'center' }}
            style={{ width: '100%' }}
            showsVerticalScrollIndicator={false}
          >
            <VStack space="md" w="90%" alignSelf="center" py="$4">
              <Text color="$white" fontSize="$lg" fontFamily="$heading" lineHeight="$xl">
                Registrar Nova Peça
              </Text>

              <Select onValueChange={setSelectedPiece} selectedValue={selectedPiece}>
                <SelectTrigger 
                  bg="$gray500" 
                  borderRadius="$xl" 
                  height="$12"  
                  borderWidth="$1" 
                  borderColor="$coolGray500"
                  flexDirection="row"
                  justifyContent="space-between"
                  alignItems="center"
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
                    
                    borderRadius="$lg"
                  >
                    <SelectDragIndicatorWrapper>
                      <SelectDragIndicator />
                    </SelectDragIndicatorWrapper>

                    {[ 
                      {label: "Blusa", value: "blusa" }, 
                      {label: "Vestido", value: "vestido" }, 
                      {label: "Calça", value: "calca"} 
                    ].map(({ label, value }) => (
                      <SelectItem  
                        key={value}
                        value={value}
                        label={label}
                        bg="$gray600"
                        
                      />
                    ))}
                  </SelectContent>
                </SelectPortal>
              </Select>

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
                  editable={false} 
                  color="$white" 
                />

                <Input 
                  editable={false} 
                  value={`Registro: ${registerId.slice(0, 6)}`} 
                />
              </Center>

              <Button 
                title="Gerar Novo Registro" 
                onPress={handleGenerateNewRegisterId}
              />
              
              <Button 
                title="Abrir Menu" 
                onPress={() => setIsOpen(true)} 
              />
            </VStack>
          </ScrollView>

          <Actionsheet isOpen={isOpen} onClose={() => setIsOpen(false)}>
            <ActionsheetBackdrop />
            <ActionsheetContent>
              {/* Aqui adicionamos as opções depois */}
            </ActionsheetContent>
          </Actionsheet>
        </Center>
      </TouchableWithoutFeedback>
    </KeyboardAvoidingView>
  );
}
