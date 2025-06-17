import { useState, useEffect } from 'react';
import { Dimensions, Alert } from 'react-native';
import {
  VStack,
  Text,
  ScrollView,
  Select,
  SelectTrigger,
  SelectInput,
  SelectIcon,
  SelectPortal,
  SelectBackdrop,
  SelectContent,
  SelectItem,
  Box,
  HStack,
  Center,
} from '@gluestack-ui/themed';
import Feather from 'react-native-vector-icons/Feather';
import Ionicons from 'react-native-vector-icons/Ionicons';
import Foundation from 'react-native-vector-icons/Foundation';
import AntDesign from 'react-native-vector-icons/AntDesign';
import { PieChart, LineChart } from 'react-native-chart-kit';
import { useProduct, Product } from '@contexts/ProductContext';
import { useSales, OpenSaleItem } from '@contexts/SalesContext';

export function Home() {
  // Access products and sales from contexts
  const { products } = useProduct();
  const { openSales, shipments } = useSales();

  // Initialize states
  const [totalCost, setTotalCost] = useState(0);
  const [totalSales, setTotalSales] = useState(0);
  const [totalFreight, setTotalFreight] = useState(0); // New state for freight
  const [totalSold, setTotalSold] = useState(0);
  const [totalProfit, setTotalProfit] = useState(0);
  const [selectedPeriod, setSelectedPeriod] = useState<'Diário' | 'Semanal' | 'Mensal'>('Mensal');

  // Placeholder chart data
  const [pieChartData, setPieChartData] = useState([
    { name: 'Saídas', value: 0, color: '#FF6384', legendFontColor: '#FFFFFF', legendFontSize: 15 },
    { name: 'Entradas', value: 0, color: '#36A2EB', legendFontColor: '#FFFFFF', legendFontSize: 15 },
    { name: 'Frete', value: 0, color: '#F59E0B', legendFontColor: '#FFFFFF', legendFontSize: 15 }, // Added freight
  ]);

  const [lineChartData] = useState({
    labels: ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun'],
    datasets: [
      { data: [0, 0, 0, 0, 0, 0], color: () => '#36A2EB' },
      { data: [0, 0, 0, 0, 0, 0], color: () => '#FF6384' },
    ],
    legend: ['Vendas', 'Custos'],
  });

  // Calculate total cost, sales, freight, and sold items
  useEffect(() => {
    // Calculate total cost from products
    const calculatedCost = products.reduce((sum, product) => sum + product.costPrice, 0);
    setTotalCost(calculatedCost);

    // Combine openSales and shipments for paid sales
    const allSales = [...openSales, ...shipments].filter(sale => sale.isPaid);

    // Calculate total sales (excluding freight)
    const calculatedSales = allSales.reduce((sum, sale) => sum + sale.total, 0);
    setTotalSales(calculatedSales);

    // Calculate total freight
    const calculatedFreight = allSales.reduce((sum, sale) => {
      return sum + (sale.isFreightPaid ? sale.freightValue || 0 : 0);
    }, 0);
    setTotalFreight(calculatedFreight);

    // Calculate total sold items (sum of product quantities)
    const calculatedSold = allSales.reduce((sum, sale) => {
      return sum + sale.selectedProducts.reduce((total, product) => total + (product.quantity || 1), 0);
    }, 0);
    setTotalSold(calculatedSold);

    // Calculate total profit (sales - cost, freight not included in profit)
    setTotalProfit(calculatedSales - calculatedCost);

    // Update pie chart data
    setPieChartData([
      { name: 'Saídas', value: calculatedCost, color: '#FF6384', legendFontColor: '#FFFFFF', legendFontSize: 15 },
      { name: 'Entradas', value: calculatedSales, color: '#36A2EB', legendFontColor: '#FFFFFF', legendFontSize: 15 },
      { name: 'Frete', value: calculatedFreight, color: '#F59E0B', legendFontColor: '#FFFFFF', legendFontSize: 15 },
    ]);
  }, [products, openSales, shipments]);

  // Handle period change
  const handlePeriodChange = (period: string) => {
    if (['Diário', 'Semanal', 'Mensal'].includes(period)) {
      setSelectedPeriod(period as 'Diário' | 'Semanal' | 'Mensal');
    } else {
      console.warn(`Invalid period value: ${period}`);
    }
  };

  // Notification logic remains unchanged
  const showNotification = () => {
    if (totalProfit > 0) {
      Alert.alert('Notificação', 'Os lucros mensais ultrapassaram a meta!');
    }
  };

  return (
    <VStack flex={1} bg="$backgroundDark900" px="$4" pt="$16">
      <Text
        color="$textLight400"
        fontSize="$2xl"
        mb="$4"
        fontFamily="$heading"
        lineHeight="$xl"
      >
        Dashboard
      </Text>

      {totalProfit > 0 && (
        <Box bg="$purple700" p="$4" rounded="$xl" mb="$4" px="$2">
          <HStack alignItems="center" gap="$2">
            <Feather name="trending-up" size={20} color="#FFF" />
            <Text color="$white" lineHeight="$xl" fontFamily="$heading">
              Você ultrapassou sua meta de vendas este mês!
            </Text>
          </HStack>
        </Box>
      )}

      <ScrollView flex={1} showsVerticalScrollIndicator={false}>
        <Box bg="$backgroundDark800" p="$4" rounded="$xl" mb="$4">
          <Text color="$textLight400" fontSize="$lg" mb="$2" lineHeight="$xl" fontFamily="$heading">
            Filtrar por Período:
          </Text>
          <Select selectedValue={selectedPeriod} onValueChange={handlePeriodChange}>
            <SelectTrigger px="$2">
              <SelectInput placeholder="Selecione um período" color="$textLight400" px="$2" />
              <SelectIcon as={() => <Feather name="calendar" size={20} color="#FFF" />} />
            </SelectTrigger>
            <SelectPortal>
              <SelectBackdrop />
              <SelectContent bg="$backgroundDark800" rounded="$xl" p="$4">
                <SelectItem label="Diário" value="Diário" />
                <SelectItem label="Semanal" value="Semanal" />
                <SelectItem label="Mensal" value="Mensal" />
              </SelectContent>
            </SelectPortal>
          </Select>
        </Box>

        <Box bg="$backgroundDark800" p="$4" rounded="$xl" mb="$4">
          <Text color="$textLight400" fontSize="$lg" mb="$2">Métricas:</Text>
          <HStack justifyContent="space-between">
            <Center>
              <Foundation name="dollar-bill" size={28} color="#3B82F6" />
              <Text color="$textLight400">Entradas:</Text>
              <Text color="$textLight400" fontWeight="$bold">
                R$ {totalSales.toFixed(2)}
              </Text>
            </Center>
            <Center>
              <Feather name="arrow-down" size={28} color="#EF4444" />
              <Text color="$textLight400">Saídas:</Text>
              <Text color="$textLight400" fontWeight="$bold">
                R$ {totalCost.toFixed(2)}
              </Text>
            </Center>
            <Center>
              <AntDesign name="barschart" size={28} color="#10B981" />
              <Text color="$textLight400">Lucro:</Text>
              <Text color="$textLight400" fontWeight="$bold">
                R$ {totalProfit.toFixed(2)}
              </Text>
            </Center>
            <Center>
              <Ionicons name="car" size={28} color="#F59E0B" />
              <Text color="$textLight400">Frete:</Text>
              <Text color="$textLight400" fontWeight="$bold">
                R$ {totalFreight.toFixed(2)}
              </Text>
            </Center>
          </HStack>
        </Box>

        <PieChart
          data={pieChartData}
          width={Dimensions.get('window').width - 32}
          height={220}
          chartConfig={{
            color: (opacity = 1) => `rgba(255, 255, 255, ${opacity})`,
            labelColor: () => '#FFFFFF',
          }}
          accessor="value"
          backgroundColor="transparent"
          paddingLeft="15"
          center={[0, 0]}
        />

        <Text color="$textLight400" fontSize="$lg" mt="$4" mb="$2">
          Performance Mensal:
        </Text>
        <LineChart
          data={lineChartData}
          width={Dimensions.get('window').width - 32}
          height={220}
          chartConfig={{
            backgroundGradientFrom: '#1E2923',
            backgroundGradientTo: '#08130D',
            color: (opacity = 1) => `rgba(26, 255, 146, ${opacity})`,
            labelColor: () => '#FFFFFF',
          }}
          bezier
          style={{ borderRadius: 22, paddingBottom: 8 }}
        />
      </ScrollView>
    </VStack>
  );
}