import { useState } from 'react';
import { useRouter } from 'expo-router';
import {
  Center, Text, VStack, Actionsheet, ActionsheetBackdrop, ActionsheetContent,
  Select, SelectTrigger, SelectInput, SelectIcon, SelectPortal, SelectBackdrop,
  SelectContent, SelectDragIndicatorWrapper, SelectItem
} from '@gluestack-ui/themed';
import {
  KeyboardAvoidingView, Platform, ScrollView, Keyboard, TouchableWithoutFeedback
} from 'react-native';

import { Input } from '@components/Input';
import { Button } from '@components/Button';

const generateRegisterId = () => Math.floor(100000 + Math.random() * 900000).toString();

export function NewRegister() {
  const router = useRouter();

  const [form, setForm] = useState({
    name: '',
    description: '',
    selectedPiece: '',
    rawCostPrice: '',
    costPrice: '',
    rawProfitMargin: '',
    profitMargin: '',
    salePrice: '',
    registerId: generateRegisterId()
  });

  const [isOpen, setIsOpen] = useState(false);

  const updateForm = (field: string, value: string) => {
    setForm(prev => ({ ...prev, [field]: value }));
  };

  const handleProfitMarginChange = (text: string) => {
    const raw = text.replace(/[^0-9]/g, "");
    updateForm('rawProfitMargin', raw);
    updateForm('profitMargin', text);
  };

  const handleProfitMarginBlur = () => {
    updateForm('profitMargin', form.rawProfitMargin ? `${form.rawProfitMargin}%` : '');
  };

  const handleCostPriceChange = (text: string) => {
    const raw = text.replace(/[^0-9,]/g, "").replace(",", ".");
    updateForm('rawCostPrice', raw);
    updateForm('costPrice', text);
  };

  const handleCostPriceBlur = () => {
    if (form.rawCostPrice) {
      const formatted = `R$ ${parseFloat(form.rawCostPrice).toFixed(2).replace(".", ",")}`;
      updateForm('costPrice', formatted);
      calculateSalePrice();
    } else {
      updateForm('costPrice', '');
    }
  };

  const calculateSalePrice = () => {
    const cost = parseFloat(form.rawCostPrice);
    const margin = parseFloat(form.rawProfitMargin);
    if (!isNaN(cost) && !isNaN(margin)) {
      const sale = cost + (cost * (margin / 100));
      updateForm('salePrice', `R$ ${sale.toFixed(2).replace(".", ",")}`);
    }
  };

  const handleNewRegisterId = () => {
    updateForm('registerId', generateRegisterId());
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

              <Select
                onValueChange={value => updateForm('selectedPiece', value)}
                selectedValue={form.selectedPiece}
              >
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
                  <SelectContent bg="$trueGray700" width="100%" borderRadius="$lg">
                    <SelectDragIndicatorWrapper />
                    {[
                      "Blusa", "Camisa", "Camiseta", "T-Shirt", "Top",
                      "Saia", "Short", "Calça", "Vestido", "Calçados", "Acessórios"
                    ].map((label) => (
                      <SelectItem
                        key={label}
                        value={label.toLowerCase()}
                        label={label}
                        bg="$gray600"
                        sx={{ _text: { color: "$white" } }}
                      />
                    ))}
                  </SelectContent>
                </SelectPortal>
              </Select>

              <Input
                placeholder="Descrição"
                value={form.description}
                onChangeText={text => updateForm('description', text)}
              />

              <Input
                placeholder="Preço de Custo"
                value={form.costPrice}
                onChangeText={handleCostPriceChange}
                onBlur={handleCostPriceBlur}
                keyboardType="numeric"
              />

              <Input
                placeholder="Margem de Lucro (%)"
                value={form.profitMargin}
                keyboardType="numeric"
                onChangeText={handleProfitMarginChange}
                onBlur={handleProfitMarginBlur}
              />

              <Center mt="$4" gap="$2">
                <Button title="Calcular Preço de Venda" onPress={calculateSalePrice} />
              </Center>

              <Center gap="$2">
                <Input
                  placeholder="Preço de Venda"
                  value={form.salePrice}
                  editable={false}
                  color="$white"
                />
                <Input
                  editable={false}
                  value={`Registro: ${form.registerId.slice(0, 6)}`}
                />
              </Center>

              <Button title="Gerar Novo Registro" onPress={handleNewRegisterId} />
              <Button title="Abrir Menu" onPress={() => setIsOpen(true)} />
            </VStack>
          </ScrollView>

          <Actionsheet isOpen={isOpen} onClose={() => setIsOpen(false)}>
            <ActionsheetBackdrop />
            <ActionsheetContent>
              {/* Opções do menu aqui */}
            </ActionsheetContent>
          </Actionsheet>
        </Center>
      </TouchableWithoutFeedback>
    </KeyboardAvoidingView>
  );
}
