import { useProduct } from '@contexts/ProductContext';
import { useState, useMemo } from 'react';
import { FlatList, TouchableOpacity, Modal } from 'react-native';
import { VStack, HStack, Text, Box, Button } from '@gluestack-ui/themed';

import { Eye, EyeOff } from 'lucide-react-native';
import BackButton from '@components/BackButton';


export function StockUp() {
  const { products } = useProduct();
  const [selectedType, setSelectedType] = useState<string | null>(null);
  const [selectedItem, setSelectedItem] = useState<any>(null);

  const uniqueTypes = useMemo(() => {
    const types = products.map(p => p.type);
    return Array.from(new Set(types));
  }, [products]);

  const filteredProducts = useMemo(() => {
    if (!selectedType) return products;
    return products.filter(p => p.type === selectedType);
  }, [products, selectedType]);

  return (
    <VStack flex={1} px="$3" pt="$12" pb="$10">
      <BackButton />
      <Text
        color="$white"
        fontSize="$lg"
        fontFamily="$heading"
        mt="$8"
        mb="$6"
        lineHeight="$lg"
      >
        Estoque de Peças
      </Text>

      <FlatList
        horizontal
        data={["Todos", ...uniqueTypes]}
        keyExtractor={(item) => item}
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{ marginBottom: 1 }}
        ItemSeparatorComponent={() => <Box width={8} />}
        renderItem={({ item }) => {
          const isSelected = selectedType === item || (item === 'Todos' && selectedType === null);
          return (
            <TouchableOpacity 
              onPress={() => setSelectedType(item === 'Todos' ? null : item)}
            >
              <Box
                px="$8"
                py="$2"
                bg={isSelected ? "$purple700" : "$backgroundDark700"}
                borderRadius="$lg"
                borderWidth={1}
                borderColor={isSelected ? "$purple700" : "$backgroundDark500"}
              >
                <Text
                  color={isSelected ? "$white" : "$gray300"}
                  fontSize="$lg"
                  fontFamily="$heading"
                  lineHeight="$md"
                >
                  {item}
                </Text>
              </Box>
            </TouchableOpacity>
          );
        }}
      />

      <FlatList
        data={filteredProducts}
        keyExtractor={(item) => item.id}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 50 }}
        renderItem={({ item }) => (
          <Box
            bg="$backgroundDark900"
            p="$4"
            borderRadius="$2xl"
            mb="$4"
            style={{
              elevation: 6,
              shadowColor: "#000",
              shadowOffset: { width: 0, height: 4 },
              shadowOpacity: 0.2,
              shadowRadius: 22,
            }}
          >
            <HStack justifyContent="space-between" alignItems="center" mb="$3">
              <Text
                color="$white"
                fontSize="$lg"
                fontFamily="$heading"
                lineHeight="$md"
              >
                {item.type}
              </Text>
              <Box
                px="$3"
                py="$2"
                bg="$gray700"
                borderRadius="$sm"
              >
                <VStack alignItems="center" gap="$1">
                  <Text 
                    fontSize="$md" 
                    color="$green500" 
                    lineHeight="$sm"
                    fontWeight="$bold"
                  >
                    {item.name}
                  </Text>

                  <Text color="$trueGray400">
                    COD: 123456
                  </Text>
                </VStack>
              </Box>
            </HStack>

            <Text
              color="$white"
              fontSize="$sm"
              lineHeight="$md"
            >
              {item.description}
            </Text>

            <Button 
              w="$16" 
              alignSelf="flex-end" 
              bg="$purple700" 
              rounded="$xl"
              onPress={() => setSelectedItem(item)}
            >
              <Eye color="white" />
            </Button>
          </Box>
        )}
        ListEmptyComponent={
          <Text
            color="$gray400"
            mt="$6"
            textAlign="center"
            lineHeight="$lg"
          >
            Nenhuma peça encontrada para esse tipo.
          </Text>
        }
      />

      <Modal
        visible={!!selectedItem}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setSelectedItem(null)}
      >
         <Box
          flex={1}
          justifyContent="center"
          alignItems="center"
          bg="rgba(0,0,0,0.6)"
        >
          <Box
            bg="$backgroundDark900"
            p="$6"
            borderRadius="$2xl"
            width="90%"
          >
            <Text fontSize="$lg" fontFamily="$heading" color="$white" mb="$4">
              Detalhes da Peça
            </Text>

            <Text color="$white" mb="$1">Nome: {selectedItem?.name}</Text>
            <Text color="$white" mb="$1">Tipo: {selectedItem?.type}</Text>
            <Text color="$white" mb="$1">Descrição: {selectedItem?.description}</Text>
            <Text color="$white" mb="$1">Código: {selectedItem?.id}</Text>
            <Text color="$red400" mb="$1">Preço de Custo: R$ {selectedItem?.costPrice?.toFixed(2).replace('.', ',')}</Text>
            <Text color="$green400" mb="$4">Preço de Venda: R$ {selectedItem?.salePrice?.toFixed(2).replace('.', ',')}</Text>

            <Button 
              w="$16" 
              alignSelf="flex-end" 
              bg="$purple700" 
              rounded="$xl"
              onPress={() => setSelectedItem(null)} 
            >
              <EyeOff color="white" />
            </Button>
          </Box>
        </Box>
      </Modal>
    </VStack>
  );
}
