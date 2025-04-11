import { useState } from 'react';
import { useRouter } from 'expo-router';

import { useProduct } from '@contexts/ProductContext';

import {
  Text, VStack, HStack, Actionsheet, ActionsheetBackdrop, ActionsheetContent,
  Select, SelectTrigger, SelectInput, SelectPortal, SelectBackdrop,
  SelectContent, SelectDragIndicatorWrapper, SelectItem, Box, ActionsheetItem
} from '@gluestack-ui/themed';

import { useForm, Controller } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';

import {
  KeyboardAvoidingView, Platform, ScrollView, Keyboard, TouchableWithoutFeedback, View
} from 'react-native';

import { ClipboardList , DollarSign, Calendar } from 'lucide-react-native';

import { Input } from '@components/Input';
import { Button } from '@components/Button';

const generateRegisterId = (type: string) => {
  const prefix = type.trim().toUpperCase().slice(0, 3);
  const random = Math.floor(1000 + Math.random() * 90009);
  return `${prefix}${random}`;
};

const PIECES = [
  'Blusa', 'Camisa', 'Camiseta', 'T-Shirt', 'Top', 'Saia', 'Short',
  'Calça', 'Vestido', 'Calçados', 'Acessórios'
];

type FormDataProps = {
  description: string;
  costPrice: string;
  profitMargin: string;
  selectedPiece: string;
};

const newRegisterSchema = yup.object({
  description: yup.string().required("Informe a descrição"),
  costPrice: yup.string().required("Informe o preço de custo"),
  profitMargin: yup.string().required("Informe a margem de lucro"),
  selectedPiece: yup.string().required("Escolha uma peça"),
});

export function NewRegister() {
  const { control, handleSubmit, formState: { errors }, reset, setValue, clearErrors } = useForm <FormDataProps>({
    resolver: yupResolver(newRegisterSchema),
    defaultValues: {
      description: '',
      costPrice: '',
      profitMargin: '',
      selectedPiece: '',
    },
  })

  const [name, setName] = useState('');
  const [registerId, setRegisterId] = useState(generateRegisterId("Peca")); 
  const [description, setDescription] = useState('');
  const [rawCostPrice, setRawCostPrice] = useState('');
  const [rawProfitMargin, setRawProfitMargin] = useState('');
  const [salePrice, setSalePrice] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const router = useRouter();
  const { addProduct } = useProduct();
  const [dropdownReady, setDropdownReady] = useState(false);
  const [sheetReady, setSheetReady] = useState(false);

  const handleRegister = (data: FormDataProps) => {
    const cost = parseFloat(data.costPrice.replace(',', '.'));
    const margin = parseFloat(data.profitMargin.replace('%', ''));
    const sale = cost + (cost * (margin / 100));

    const newId = generateRegisterId(data.selectedPiece);
  
    const product = {
      id: registerId,
      name,
      type: data.selectedPiece,
      description: data.description,
      costPrice: cost,
      profitMargin: margin,
      salePrice: sale,
    };
  
    addProduct(product);
  
    setRegisterId(newId);
  
    reset();
    setSalePrice('');
  };

  const handleProfitMarginChange = (text: string) => {
    const numeric = text.replace(/[^0-9]/g, '');
    setRawProfitMargin(numeric);
    setValue('profitMargin', numeric);
    if (numeric !== "") {
      clearErrors('profitMargin');
    }
  };

  const handleProfitMarginBlur = () => {
    if (rawProfitMargin) setValue('profitMargin', `${rawProfitMargin}%`);
    else setValue('profitMargin', '');
  };

  const handleCostPriceChange = (text: string) => {
    const numeric = text.replace(/[^0-9,]/g, '').replace(',', '.');
    setRawCostPrice(numeric);
    setValue('costPrice', numeric);
    if (numeric !== "") {
      clearErrors('costPrice');
    }
  };

  const handleCostPriceBlur = () => {
    if (rawCostPrice) {
      const formatted = `R$ ${parseFloat(rawCostPrice).toFixed(2).replace('.', ',')}`;
      setValue('costPrice', formatted);
    } else {
      setValue('costPrice', '');
    }
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
        <View style={{ flex: 1, backgroundColor: '#262626' }}>
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

              <Controller 
                name="selectedPiece"
                control={control}
                render={({ field: { onChange, value } }) => (
                  <Select
                  selectedValue={value}
                  onValueChange={(itemValue) => {
                    onChange(itemValue);
                  }}
                  onOpen={handleOpenDropdown}
                >
                  <SelectTrigger 
                    variant="outline" 
                    size="md"
                    h="$12"
                    rounded="$lg"
                    borderColor={errors.selectedPiece ? "$red500" : "$trueGray500"}
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
                )}
              />

              <Controller 
                name="description"
                control={control}
                render={({ field: { onChange, value } }) => {
                  return (
                    <Input 
                      placeholder="Descrição" 
                      value={value} 
                      onChangeText={onChange} 
                      errorMessage={errors.description?.message}
                    />
                  )
                }}
              />

              <Controller 
                name="costPrice"
                control={control}
                render={({ field: { value, onBlur } }) => {
                  return (
                    <Input 
                      placeholder="Preço de Custo" 
                      value={value} 
                      onChangeText={handleCostPriceChange} 
                      onBlur={() => {
                        onBlur(); 
                        handleCostPriceBlur();
                      }} 
                      keyboardType="numeric" 
                      errorMessage={errors.costPrice?.message}
                    />
                  )
                }}
              />

              <Controller 
                name="profitMargin"
                control={control}
                render={({ field: { value, onBlur } }) => {
                  return (
                    <Input 
                      placeholder="Margem de Lucro" 
                      value={value} 
                      onChangeText={handleProfitMarginChange} 
                      onBlur={() => {
                        onBlur(); 
                        handleProfitMarginBlur();
                      }} 
                      keyboardType="numeric" 
                      errorMessage={errors.profitMargin?.message}
                    />
                  )
                }}
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
                value={`Cod: ${registerId.slice(0, 7)}`} 
              />

              <Button 
                title="Gerar Novo Registro" 
                onPress={handleSubmit(handleRegister)} 
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
