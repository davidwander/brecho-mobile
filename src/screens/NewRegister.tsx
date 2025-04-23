import { useState } from 'react';
import { useProduct } from '@contexts/ProductContext';
import { Text, VStack } from '@gluestack-ui/themed';

import { useForm, Controller } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { KeyboardAvoidingView, Platform, ScrollView, Keyboard, TouchableWithoutFeedback, View } from 'react-native';

import { Input } from '@components/Input';
import { Button } from '@components/Button';
import { DropdownSelector, PIECES } from '@components/DropdownSelector';
import { ActionSheetMenu } from '@components/ActionSheetMenu';
import { ButtonSpinner } from '@gluestack-ui/themed';


const generateRegisterId = (type: string) => {
  const prefix = type.trim().toUpperCase().slice(0, 3);
  const random = Math.floor(1000 + Math.random() * 90009);
  return `${prefix}${random}`;
};

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
  const { control, handleSubmit, formState: { errors }, reset, setValue, clearErrors } = useForm<FormDataProps>({
    resolver: yupResolver(newRegisterSchema),
    defaultValues: {
      description: "",
      costPrice: "",
      profitMargin: "",
      selectedPiece: "",
    },
  });

  const [selectedType, setSelectedType] = useState('');
  const [registerId, setRegisterId] = useState(generateRegisterId("Peca"));
  const [rawCostPrice, setRawCostPrice] = useState('');
  const [rawProfitMargin, setRawProfitMargin] = useState('');
  const [salePrice, setSalePrice] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const { addProduct } = useProduct();
  const [dropdownReady, setDropdownReady] = useState(false);
  const [sheetReady, setSheetReady] = useState(false);

  const [isCalculating, setIsCalculating] = useState(false);
  const [isRegistering, setIsRegistering] = useState(false);

  const handleRegister = (data: FormDataProps) => {
    setIsRegistering(true);
    setTimeout(() => {
      const cost = parseFloat(data.costPrice
        .replace("R$", "")
        .replace(",", ".")
        .trim());
      const margin = parseFloat(data.profitMargin.replace("%", ""));
      const sale = cost + (cost * (margin / 100));
  
      const newId = generateRegisterId(data.selectedPiece);
  
      const product = {
        id: newId,
        name: data.selectedPiece,
        type: data.selectedPiece,
        description: data.description,
        costPrice: cost,
        profitMargin: margin,
        salePrice: sale,
        createdAt: new Date().toISOString()
      };
  
      addProduct(product);
  
      setRegisterId(newId);
      reset();
      setRawCostPrice("");
      setRawProfitMargin("");
      setSalePrice("");

      setIsRegistering(false);
    }, 700);
  };

  const handleProfitMarginChange = (text: string) => {
    const numeric = text.replace(/[^0-9]/g, "");
    setRawProfitMargin(numeric);
    setValue("profitMargin", numeric);
    if (numeric !== "") clearErrors("profitMargin");
  };

  const handleProfitMarginBlur = () => {
    if (rawProfitMargin) setValue("profitMargin", `${rawProfitMargin}%`);
    else setValue("profitMargin", "");
  };

  const handleCostPriceChange = (text: string) => {
    const numeric = text.replace(/[^0-9,]/g, "").replace(",", ".");
    setRawCostPrice(numeric);
    setValue("costPrice", numeric);
    if (numeric !== "") clearErrors("costPrice");
  };

  const handleCostPriceBlur = () => {
    if (rawCostPrice) {
      const formatted = `R$ ${parseFloat(rawCostPrice)
        .toFixed(2)
        .replace(".", ",")}`;
      setValue("costPrice", formatted);
    } else {
      setValue("costPrice", "");
    }
    calculateSalePrice();
  };

  const calculateSalePrice = () => {
    setIsCalculating(true);
    setTimeout(() => {
      const cost = parseFloat(rawCostPrice);
      const margin = parseFloat(rawProfitMargin);
      if (!isNaN(cost) && !isNaN(margin)) {
        const sale = cost + (cost * (margin / 100));
        setSalePrice(`R$ ${sale.toFixed(2).replace(".", ",")}`);
      }
      setIsCalculating(false);
    }, 500);
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
    <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === "ios" ? "padding" : undefined}>
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <View style={{ flex: 1, backgroundColor: "#262626" }}>
          <ScrollView
            contentContainerStyle={{
              flexGrow: 1,
              justifyContent: "center",
              paddingVertical: 40,
              paddingHorizontal: 20,
            }}
            showsVerticalScrollIndicator={false}
          >
            <VStack space="md">
              <Text 
                color="$white" 
                fontSize="$2xl" 
                fontFamily="$heading" lineHeight="$xl"
              >
                Registrar Nova Peça
              </Text>

              <Controller
                name="selectedPiece"
                control={control}
                render={({ field: { onChange, value } }) => (
                  <DropdownSelector
                    value={value || selectedType} 
                    onChange={(val) => {
                      onChange(val); 
                      setSelectedType(val); 
                    }}
                    error={!!errors.selectedPiece}
                    pieces={PIECES}
                    onOpen={handleOpenDropdown}
                    dropdownReady={dropdownReady}
                  />
                )}
              />

              <Controller
                name="description"
                control={control}
                render={({ field: { onChange, value } }) => (
                  <Input
                    placeholder="Descrição da peça"
                    value={value}
                    onChangeText={onChange}
                    errorMessage={errors.description?.message}
                  />
                )}
              />

              <Controller
                name="costPrice"
                control={control}
                render={({ field: { value, onBlur } }) => (
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
                )}
              />

              <Controller
                name="profitMargin"
                control={control}
                render={({ field: { value, onBlur } }) => (
                  <Input
                    placeholder="Margem de Lucro (%)"
                    value={value}
                    onChangeText={handleProfitMarginChange}
                    onBlur={() => {
                      onBlur();
                      handleProfitMarginBlur();
                    }}
                    keyboardType="numeric"
                    errorMessage={errors.profitMargin?.message}
                  />
                )}
              />

              <Button 
                title="Calcular valor de venda"
                onPress={calculateSalePrice} 
                isLoading={isCalculating}
              />
              <Input 
                placeholder="Preço de Venda" 
                value={salePrice} 
                editable={false} color="$white" 
              />

              <Input editable={false} value={`Cod: ${registerId.slice(0, 7)}`} />

              <Button 
                title="Gerar Novo Registro" 
                onPress={handleSubmit(handleRegister)} 
                isLoading={isRegistering}
              />
              <Button 
                title="Abrir Menu" 
                onPress={openSheet} 
                variant="outline" 
              />
            </VStack>
          </ScrollView>

          <ActionSheetMenu 
            isOpen={isOpen} 
            onClose={closeSheet} 
            sheetReady={sheetReady} 
          />
        </View>
      </TouchableWithoutFeedback>
    </KeyboardAvoidingView>
  );
}
