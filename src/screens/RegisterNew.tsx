import { useState } from 'react';
import { Center, Text, VStack } from '@gluestack-ui/themed';
import { Input } from '@components/Input';
import { Button } from '@components/Button'; 

export function RegisterNew() {
  const [name, setName] = useState('');
  const [registerId, setRegisterId] = useState(Date.now().toString()); 
  const [costPrice, setCostPrice] = useState('');
  const [profitMargin, setProfitMargin] = useState('');
  const [salePrice, setSalePrice] = useState('');

  const calculateSalePrice = () => {
    const cost = parseFloat(costPrice);
    const margin = parseFloat(profitMargin);
    if (!isNaN(cost) && !isNaN(margin)) {
      const sale = cost + (cost * (margin / 100));
      setSalePrice(sale.toFixed(2));
    }
  }

  return (
    <Center flex={1} bg="$textDark900" >
      <VStack space="md" w="90%">
        <Text 
          color="$white" 
          fontSize="$lg" 
          fontFamily="$heading"
          lineHeight="$xl"
        >
          Registrar Nova Peça
        </Text>
        
        <Input
          placeholder="Nome da Peça"
          value={name}
          onChangeText={setName}
        />

        <Input 
          placeholder="Preço de Custo"
          value={costPrice}
          onChangeText={setCostPrice}
          keyboardType="numeric"
          onBlur={calculateSalePrice}
        />

        <Input 
          placeholder="Margem de Lucro (%)"
          value={profitMargin}
          keyboardType="numeric"
          onChangeText={setProfitMargin}
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
            value={`Registro: ${registerId}`}
          />
        </Center>

        <Button 
            title="Gerar Novo Registro" 
            onPress={() => setRegisterId(Date.now().toString())}
          />
      </VStack>
    </Center>
  );
}
