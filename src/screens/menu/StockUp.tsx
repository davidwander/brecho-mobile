import { useProduct } from "@contexts/ProductContext";
import { useSales, ClientData, ProductItem } from "@contexts/SalesContext"; // Importando tipos do contexto
import { useState, useMemo } from "react";
import { FlatList, TouchableOpacity } from "react-native";
import { VStack, HStack, Text, Box, Button as GluestackButton } from "@gluestack-ui/themed";
import { Eye, Tag, DollarSign, Check, ShoppingBag } from "lucide-react-native";
import BackButton from "@components/BackButton";
import ProductDetailsModal from "@components/ProductDetailsModal";
import SaleDetailsModal from "@components/SaleDetailsModal"; // Importando o novo modal
import { Checkbox } from "@gluestack-ui/themed";
import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { RootStackParamList } from "@routes/AppStackRoutes";
import { Button } from "@components/Button"; // Importando o componente Button personalizado

export function StockUp() {
  const { products } = useProduct();
  const salesContext = useSales();
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();

  const [selectedType, setSelectedType] = useState<string | null>(null);
  const [selectedItem, setSelectedItem] = useState<any>(null); // Para ProductDetailsModal
  const [selectedProductIds, setSelectedProductIds] = useState<string[]>([]);
  const [isSaleModalVisible, setIsSaleModalVisible] = useState(false); // Estado para o novo modal
  const [currentSelectedProducts, setCurrentSelectedProducts] = useState<ProductItem[]>([]); // Estado para guardar produtos selecionados para o modal

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

  // Função para ABRIR o modal de confirmação
  const handleOpenSaleModal = () => {
    if (selectedProductIds.length === 0) {
      return;
    }

    // Filtrar os produtos completos com base nos IDs selecionados
    const selectedProductsData = products.filter(product =>
      selectedProductIds.includes(product.id)
    );
    setCurrentSelectedProducts(selectedProductsData); // Guarda os produtos para passar ao modal

    // Salvar os produtos selecionados no contexto (pode ser feito aqui ou na confirmação final)
    if (salesContext && typeof salesContext.setSelectedProducts === "function") {
      salesContext.setSelectedProducts(selectedProductsData);
    } else {
      console.error("Contexto de vendas não está disponível ou setSelectedProducts não é uma função");
      return; // Não abre o modal se o contexto falhar
    }

    setIsSaleModalVisible(true); // Abre o modal
  };

  // Função chamada ao CONFIRMAR dentro do SaleDetailsModal
  const handleModalConfirm = () => {
    setIsSaleModalVisible(false); // Fecha o modal
    // Navega para a tela de resumo de vendas
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

      {/* Filtro de Tipos */}
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

      {/* Lista de Produtos */}
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
                    <Checkbox.Icon as={ShoppingBag} color="white" size="lg" />
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
                  Custo: R$ {item.costPrice.toFixed(2).replace(".", ",")}
                </Text>
              </HStack>

              <HStack alignItems="center" gap="$1">
                <Tag size={20} color="#888" />
                <Text color="$white" fontSize="$sm">
                  Venda: R$ {item.salePrice.toFixed(2).replace(".", ",")}
                </Text>
              </HStack>

              {/* Botão Ver Detalhes (Produto) */}
              <GluestackButton
                w="$16"
                bg="$purple700"
                rounded="$xl"
                onPress={() => setSelectedItem(item)}
              >
                <HStack alignItems="center" justifyContent="center">
                  <Eye color="white" size={24} />
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

      {/* Botão para ABRIR o modal de confirmação */}
      {selectedProductIds.length > 0 && (
        <Box
          position="absolute"
          bottom="$6"
          alignSelf="center"
          width="80%"
          px="$4"
        >
          <Button
            title={`Revisar Venda (${selectedProductIds.length} ${selectedProductIds.length === 1 ? 'peça' : 'peças'})`}
            variant="solid"
            onPress={handleOpenSaleModal} // Chama a função para abrir o modal
            isDisabled={selectedProductIds.length === 0}
            // isLoading não é mais necessário aqui, pois a confirmação é no modal
          />
        </Box>
      )}

      {/* Modal de Detalhes do Produto (já existente) */}
      <ProductDetailsModal
        visible={!!selectedItem}
        item={selectedItem}
        onClose={() => setSelectedItem(null)}
      />

      {/* Modal de Detalhes/Confirmação da Venda (novo) */}
      <SaleDetailsModal
        visible={isSaleModalVisible}
        clientData={salesContext.clientData} // Pega dados do cliente do contexto
        selectedProducts={currentSelectedProducts} // Passa os produtos selecionados
        onClose={() => setIsSaleModalVisible(false)} // Função para fechar
        onConfirm={handleModalConfirm} // Função para confirmar e navegar
        isConfirmMode={true} // Define que este é o modal de confirmação
      />
    </VStack>
  );
}
