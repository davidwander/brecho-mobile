import { useProduct } from '@contexts/ProductContext';
import { useState, useMemo } from 'react';
import { FlatList, TouchableOpacity } from 'react-native';
import { VStack, HStack, Text, Box, Button } from '@gluestack-ui/themed';
import { Eye,Tag, DollarSign, Check } from 'lucide-react-native';
import BackButton from '@components/BackButton';
import ProductDetailsModal from '@components/ProductDetailsModal';
import { Checkbox } from '@gluestack-ui/themed';

export function StockUp() {
  const { products } = useProduct(); 
  const [selectedType, setSelectedType] = useState<string | null>(null);
  const [selectedItem, setSelectedItem] = useState<any>(null);
  const [selectedProducts, setSelectedProducts] = useState<string[]>([]);

  const allTypes = [
    "Blusa", "Camisa", "Camiseta", "T-Shirt", "Top", "Saia", "Short",
    "Calça", "Vestido", "Calçados", "Acessórios"
  ];

  const filteredProducts = useMemo(() => {
    if (!selectedType) return products;  
    return products.filter(
      p => p.type?.toLowerCase().trim() === selectedType.toLowerCase().trim()
    ); 
  }, [products, selectedType]);

  return (
    <VStack flex={1} px="$3" pt="$14" pb="$12" gap="$2">
      <BackButton />
      <Text
        color="$white"
        fontSize="$2xl"
        fontFamily="$heading"
        mt="$4"
        mb="$4"
        lineHeight="$lg"
        alignSelf="center"
      >
        Estoque de Peças
      </Text>

      <FlatList
        horizontal
        data={["Todos", ...allTypes]} 
        keyExtractor={(item) => item}
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 8, marginBottom: 8 }}
        style={{ maxHeight: 80 }}
        ItemSeparatorComponent={() => <Box width={8} height={6} />}
        renderItem={({ item }) => {
          const isSelected = selectedType === item || (item === 'Todos' && selectedType === null);
          return (
            <TouchableOpacity 
              style={{ 
                marginBottom: 4,
                elevation: 6,
                shadowColor: "#000",
                shadowOffset: { width: 0, height: 4 },
                shadowOpacity: 0.2,
                shadowRadius: 22,
              }}
              onPress={() => setSelectedType(item === 'Todos' ? null : item)}
            >
              <Box
                px="$8"
                py="$2"
                bg={isSelected ? "$purple700" : "$backgroundDark700"}
                borderRadius="$lg"
                borderWidth={1}
                justifyContent="center"
                alignItems="center"
                height={44}
                borderColor={isSelected ? "$purple700" : "$backgroundDark500"}
              >
                <Text
                  color={isSelected ? "$white" : "$gray300"}
                  fontSize="$md"
                  fontFamily="$heading"
                  lineHeight="$2xl"
                  alignContent="center"
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
        contentContainerStyle={{ paddingBottom: 50, flexGrow: 1 }}
        renderItem={({ item }) => (
          <Box
            bg="$backgroundDark900"
            p="$5"
            borderRadius="$3xl"
            mb="$4"
            borderWidth={1}
            borderColor="$trueGray800"
            style={{
              elevation: 10,
              shadowColor: "#000",
              shadowOffset: { width: 0, height: 4 },
              shadowOpacity: 0.15,
              shadowRadius: 12,
            }}
          >
            <HStack justifyContent="space-between" alignItems="center" mb="$3">
              <HStack alignItems="center" space="md" flex={1}>
                <Checkbox
                  value={item.id}
                  isChecked={selectedProducts.includes(item.id)}
                  onChange={() => {
                    setSelectedProducts((prev) =>
                      prev.includes(item.id)
                        ? prev.filter(id => id !== item.id)
                        : [...prev, item.id]
                    );
                  }}
                  aria-label="Selecionar peça"
                  size="lg"
                  borderWidth={2}
                  borderColor="$purple700"
                  borderRadius="$md"
                  justifyContent="center"
                  alignItems="center"
                >
                  <Checkbox.Indicator
                    bg="$purple600"
                    borderWidth={0}
                    justifyContent="center"
                    alignItems="center"
                  >
                    <Checkbox.Icon as={Check} color="white" size="lg" />
                  </Checkbox.Indicator>
                </Checkbox>
        
                <Text
                  color="$white"
                  fontSize="$2xl"
                  fontFamily="$heading"
                  lineHeight="$lg"
                >
                  {item.type}
                </Text>
              </HStack>
        
              <Box px="$1" py="$0" alignItems="flex-end">
                <Text color="$trueGray300" fontSize="$sm">
                  COD:
                </Text>
                <Text color="$trueGray100" fontSize="$xl">
                  {item.id}
                </Text>
              </Box>
            </HStack>
        
            <Box my="$3" h={1} bg="$trueGray500" borderRadius={2} />
        
            <HStack
              mt="$3"
              alignItems="center"
              justifyContent="space-between"
              flexWrap="wrap"
              gap="$4"
            >
              <HStack alignItems="center" gap="$1">
                <DollarSign size={20} color="#888" />
                <Text color="$white" fontSize="$sm">
                  Custo: R$ {item.costPrice}
                </Text>
              </HStack>

              <HStack alignItems="center" gap="$1">
                <Tag size={20} color="#888" />
                <Text color="$white" fontSize="$sm">
                  Venda: R$ {item.salePrice}
                </Text>
              </HStack>

              <Button
                w="$16"
                bg="$purple700"
                rounded="$xl"
                onPress={() => setSelectedItem(item)}
              >
                <HStack alignItems="center" justifyContent="center">
                  <Eye color="white" size={24} />
                </HStack>
              </Button>
            </HStack>

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

      <ProductDetailsModal 
        visible={!!selectedItem}
        item={selectedItem} 
        onClose={() => setSelectedItem(null)} 
      />
    </VStack>
  );
}
