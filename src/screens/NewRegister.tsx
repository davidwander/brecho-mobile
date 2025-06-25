import { useState } from 'react';
import { useProduct } from '@contexts/ProductContext';
import { Text, VStack, useToast, Toast } from '@gluestack-ui/themed';
import { useForm, Controller } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { KeyboardAvoidingView, Platform, ScrollView, Keyboard, TouchableWithoutFeedback, View } from 'react-native';
import { Input } from '@components/Input';
import { Button } from '@components/Button';
import { DropdownSelector, PIECES } from '@components/DropdownSelector';
import { ActionSheetMenu } from '@components/ActionSheetMenu';
import { ButtonSpinner } from '@gluestack-ui/themed';
import { CustomToast } from '@components/CustomToast'; 

const generateRegisterId = (type: string) => {
  const safeType = type?.trim() || 'PEC';
  
  const prefix = safeType.toUpperCase().slice(0, 3);
  
  const timestamp = new Date().getTime().toString().slice(-5);
  const random = Math.floor(1000 + Math.random() * 9000).toString();
  
  return `${prefix}-${timestamp}-${random}`;
};

type FormDataProps = {
  description: string;
  costPrice: string;
  profitMargin: string;
  selectedPiece: string;
  quantity: string;
};

const newRegisterSchema = yup.object({
  description: yup.string().required("Informe a descrição"),
  costPrice: yup.string().required("Informe o preço de custo"),
  profitMargin: yup.string().required("Informe a margem de lucro"),
  selectedPiece: yup.string().required("Escolha uma peça"),
  quantity: yup.string().required("Informe a quantidade").test('positive', 'A quantidade deve ser maior que 0', value => parseInt(value) > 0),
});

export function NewRegister() {
  const { control, handleSubmit, formState: { errors }, reset, setValue, clearErrors } = useForm<FormDataProps>({
    resolver: yupResolver(newRegisterSchema),
    defaultValues: {
      description: "",
      costPrice: "",
      profitMargin: "",
      selectedPiece: "",
      quantity: "1",
    },
  });

  const toast = useToast();
  const [selectedType, setSelectedType] = useState('');
  const [registerId, setRegisterId] = useState(generateRegisterId("Peca"));
  const [rawCostPrice, setRawCostPrice] = useState('');
  const [rawProfitMargin, setRawProfitMargin] = useState('');
  const [rawQuantity, setRawQuantity] = useState('1');
  const [salePrice, setSalePrice] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const { addProduct } = useProduct();
  const [dropdownReady, setDropdownReady] = useState(false);
  const [sheetReady, setSheetReady] = useState(false);
  const [isCalculating, setIsCalculating] = useState(false);
  const [isRegistering, setIsRegistering] = useState(false);

  const handleRegister = async (data: FormDataProps) => {
    setIsRegistering(true);
    try {
      const cost = parseFloat(data.costPrice
        .replace("R$", "")
        .replace(",", ".")
        .trim());
      const margin = parseFloat(data.profitMargin.replace("%", ""));
      const sale = cost + (cost * (margin / 100));
      const quantity = parseInt(data.quantity);

      const pieceCode = generateRegisterId(data.selectedPiece);

      const product = {
        name: data.selectedPiece,
        type: data.selectedPiece,
        description: data.description,
        costPrice: cost,
        profitMargin: margin,
        salePrice: sale,
        quantity: quantity,
        reserved: false,
        sold: false,
        code: pieceCode
      };

      console.log('Produto a ser criado:', product);

      await addProduct(product);

      reset();
      setRawCostPrice("");
      setRawProfitMargin("");
      setRawQuantity("1");
      setSalePrice("");
      
    } catch (error: any) {
      console.error("Erro ao registrar peça:", error);
    } finally {
      setIsRegistering(false);
    }
  };

  const handleProfitMarginChange = (text: string) => {
    const numeric = text.replace(/[^0-9]/g, "");
    setRawProfitMargin(numeric);
    setValue("profitMargin", numeric);
    if (numeric !== "") clearErrors("profitMargin");
  };

  type HandleProfitMarginBlur = () => void;
  
  const handleProfitMarginBlur: HandleProfitMarginBlur = () => {
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

  const handleQuantityChange = (text: string) => {
    const numeric = text.replace(/[^0-9]/g, "");
    setRawQuantity(numeric);
    setValue("quantity", numeric);
    if (numeric !== "") clearErrors("quantity");
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
                fontFamily="$heading" 
                lineHeight="$xl"
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

              <Controller
                name="quantity"
                control={control}
                render={({ field: { value } }) => (
                  <Input
                    placeholder="Quantidade"
                    value={value}
                    onChangeText={handleQuantityChange}
                    keyboardType="numeric"
                    errorMessage={errors.quantity?.message}
                  />
                )}
              />

              <Button 
                title="Calcular preço de venda"
                onPress={handleSubmit(() => calculateSalePrice())} 
                isLoading={isCalculating}
              />

              <Input 
                placeholder="Preço de Venda" 
                value={salePrice} 
                editable={false}
              />

              <Input editable={false} value={`Cod: ${registerId.slice(0, 7)}`} />

              <Button 
                title="Adicionar no Estoque" 
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