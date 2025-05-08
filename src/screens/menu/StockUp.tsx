import { useState, useMemo } from "react";
import { FlatList, TouchableOpacity } from "react-native";

import BackButton from "@components/BackButton";
import { Button } from "@components/Button";
import { useProduct } from "@contexts/ProductContext";
import { useSales, ProductItem } from "@contexts/SalesContext"; 
import { VStack, HStack, Text, Box, Button as GluestackButton } from "@gluestack-ui/themed";
import { Checkbox } from "@gluestack-ui/themed";
import { useNavigation } from "@react-navigation/native";
import { SaleDetailsModal } from "@components/SaleDetailsModal";
import { RootStackParamList } from "@routes/AppStackRoutes";
import ProductDetailsModal from "@components/ProductDetailsModal";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";

import Feather from 'react-native-vector-icons/Feather';
import FontAwesome from 'react-native-vector-icons/FontAwesome';
import Entypo from 'react-native-vector-icons/Entypo';

export function StockUp() {
  const { products } = useProduct();
  const salesContext = useSales();
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();

  const [selectedType, setSelectedType] = useState<string | null>(null);
  const [selectedItem, setSelectedItem] = useState<any>(null); 
  const [selectedProductIds, setSelectedProductIds] = useState<string[]>([]); 
  const [isSaleModalVisible, setIsSaleModalVisible] = useState(false); 
  const [currentSelectedProducts, setCurrentSelectedProducts] = useState<ProductItem[]>([]); 

  const [isLoading, setIsLoading] = useState(false);

  const allTypes = [
    "Blusa", "Camisa", "Camiseta", "T-Shirt", "Top", "Saia", "Short",
    "Calça", "Vestido", "Calçados", "Acessórios"
  ];

  const reservedProductIds = useMemo(() => {
    if (!salesContext?.openSales) return [];
    return salesContext.openSales.flatMap(sale => sale.selectedProducts.map(product => product.id));
  }, [salesContext?.openSales]);

  const filteredProducts = useMemo(() => {
    const availableProducts = products.filter(
      product => !reservedProductIds.includes(product.id)
    );
    if (!selectedType) return availableProducts;

    return availableProducts.filter(
      p => p.type?.toLowerCase().trim() === selectedType.toLowerCase().trim()
    );
  }, [products, selectedType, reservedProductIds]);

  const handleOpenSaleModal = () => {
    if (selectedProductIds.length === 0 || selectedProductIds.every(id => reservedProductIds.includes(id))) {
      return; 
    }

    setIsLoading(true);

    const selectedProductsData = products.filter(product =>
      selectedProductIds.includes(product.id)
    );

    const convertedProducts: ProductItem[] = selectedProductsData.map(product => ({
      ...product,
      quantity: 1,
      type: product.type === "entrada" || product.type === "saida" ? product.type : undefined 
    }));

    setCurrentSelectedProducts(convertedProducts);

    if (salesContext && typeof salesContext.setSelectedProducts === "function") {
      salesContext.setSelectedProducts(convertedProducts);
    } else {
      console.error("Contexto de vendas não está disponível ou setSelectedProducts não é uma função");
      return; 
    }

    setTimeout(() => {
      setIsSaleModalVisible(true);
      setIsLoading(false);
    }, 500);
  };

  const handleModalConfirm = () => {
    setIsSaleModalVisible(false); 
    navigation.navigate("openSales");
  };

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
          const isSelected = selectedType === item || (item === "Todos" && selectedType === null);
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
              onPress={() => setSelectedType(item === "Todos" ? null : item)}
            >
              <Box
                px="$8"
                py="$2"
                bg={isSelected ? "$purple700" : "$transparent"}
                borderRadius="$lg"
                borderWidth={1}
                justifyContent="center"
                alignItems="center"
                height={44}
                borderColor={isSelected ? "$purple700" : "$purple700"}
              >
                <Text
                  color={isSelected ? "$white" : "$white"}
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
        contentContainerStyle={{ paddingBottom: 100, flexGrow: 1 }}
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
                  isChecked={selectedProductIds.includes(item.id)}
                  onChange={() => {
                    if (!salesContext.clientData) {
                      alert("Crie uma sacola antes de adicionar as peças.");
                      return;
                    }
                    setSelectedProductIds((prev) =>
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
                    <Checkbox.Icon>
                      <Feather name="shopping-bag" color="white" size={20} />
                    </Checkbox.Icon>
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
                <Feather name="dollar-sign" size={20} color="#888" />
                <Text color="$white" fontSize="$sm">
                  Custo: R$ {item.costPrice.toFixed(2).replace(".", ",")}
                </Text>
              </HStack>

              <HStack alignItems="center" gap="$1">
                <Entypo name="price-tag" size={20} color="#888" />
                <Text color="$white" fontSize="$sm">
                  Venda: R$ {item.salePrice.toFixed(2).replace(".", ",")}
                </Text>
              </HStack>

              <GluestackButton
                w="$16"
                bg="$purple700"
                rounded="$xl"
                onPress={() => setSelectedItem(item)}
              >
                <HStack alignItems="center" justifyContent="center">
                  <FontAwesome name="eye" size={24} color="#fff" />
                </HStack>
              </GluestackButton>
            </HStack>
          </Box>
        )}

        ListEmptyComponent={
          <Text
            color="$white"
            mt="$6"
            textAlign="center"
            lineHeight="$lg"
          >
            Nenhuma peça encontrada.
          </Text>
        }
      />

      {selectedProductIds.length > 0 && (
        <Box
          position="absolute"
          bottom="$6"
          alignSelf="center"
          width="80%"
          px="$4"
        >
          <Button
            title={isLoading ? "Carregando..." : `Revisar Venda (${selectedProductIds.length} ${selectedProductIds.length === 1 ? 'peça' : 'peças'})`}
            variant="solid"
            onPress={handleOpenSaleModal}
            isDisabled={isLoading || selectedProductIds.length === 0 || selectedProductIds.every(id => reservedProductIds.includes(id))}
            isLoading={isLoading}
          />
        </Box>
      )}

      <ProductDetailsModal
        visible={!!selectedItem}
        item={selectedItem}
        onClose={() => setSelectedItem(null)}
      />

      <SaleDetailsModal
        visible={isSaleModalVisible}
        clientData={salesContext.clientData}
        selectedProducts={currentSelectedProducts ?? []}
        onClose={() => {
          setIsSaleModalVisible(false); // <-- CORREÇÃO: Agora corretamente definido como false
          setSelectedType(null);
        }}
        onConfirm={handleModalConfirm}
        fromStockScreen={true}
        isConfirmMode={true}
      />
    </VStack>
  );
}
