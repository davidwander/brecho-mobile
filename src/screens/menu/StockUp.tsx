import { useProduct } from '@contexts/ProductContext';
import { useState, useMemo } from 'react';
import { FlatList, TouchableOpacity, Modal } from 'react-native';
import { VStack, HStack, Text, Box, Button } from '@gluestack-ui/themed';

import { Eye, EyeOff } from 'lucide-react-native';
import BackButton from '@components/BackButton';
import ProductDetailsModal from '@components/ProductDetailsModal';

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
        mt="$4"
        mb="$4"
        lineHeight="$lg"
      >
        Estoque de Peças
      </Text>

      <FlatList
        horizontal
        data={["Todos", ...uniqueTypes]}
        keyExtractor={(item) => item}
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 4, marginBottom: 8 }}
        style={{ maxHeight: 60 }}
        ItemSeparatorComponent={() => <Box width={8} height={8} />}
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

      <ProductDetailsModal 
        visible={!!selectedItem}
        item={selectedItem}
        onClose={() => setSelectedItem(null)}
      />

    </VStack>
  );
}
