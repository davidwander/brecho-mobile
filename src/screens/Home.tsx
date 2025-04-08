import { useState } from 'react';
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
  Icon, 
  Box, 
  HStack, 
  Center 
} from '@gluestack-ui/themed';
import { PieChart, LineChart } from 'react-native-chart-kit';
import { CircleCheckBig, CircleDollarSign, ShoppingBag, ChartColumnBig, Banknote, ArrowDownToLine, ArrowUpToLine } from 'lucide-react-native';

export function Home() {
  const products = [
    { price: 100, sellingPrice: 150, sold: true },
    { price: 200, sellingPrice: 250, sold: false },
    { price: 300, sellingPrice: 350, sold: true },
  ];

  const [selectedPeriod, setSelectedPeriod] = useState("Mensal");

  const totalCost: number = 500;  // Valor fixo temporário
  const totalSales: number = 1200;
  const totalSold: number = 10;
  const totalInStock: number = 20;
  const totalProfit: number = totalSales - totalCost;

  const pieChartData = [
    { name: "Saídas", value: totalCost, color: "#FF6384", legendFontColor: "#FFFFFF", legendFontSize: 15 },
    { name: "Entradas", value: totalSales, color: "#36A2EB", legendFontColor: "#FFFFFF", legendFontSize: 15 },
  ];

  const lineChartData = {
    labels: ["Jan", "Fev", "Mar", "Abr", "Mai", "Jun"],
    datasets: [
      { data: [1200, 1500, 800, 1700, 2000, 1800], color: () => "#36A2EB" },
      { data: [1000, 1100, 700, 1400, 1600, 1500], color: () => "#FF6384" },
    ],
    legend: ["Vendas", "Custos"],
  };

  const showNotification = () => Alert.alert("Notificação", "Os lucros mensais ultrapassaram a meta!");

  return (
    <VStack flex={1} bg="$backgroundDark900" px="$4" pt="$16">
      <Text color="$textLight400" fontSize="$xl" mb="$4">
        Dashboard
      </Text>

      <Box bg="$cyan600" p="$4" rounded="$lg" mb="$4">
        <HStack alignItems="center" gap="$2">
          <Icon as={CircleCheckBig} size="sm" color="$white" />
          <Text color="$white" lineHeight="$xl" fontFamily="$heading">
            Você ultrapassou sua meta de vendas este mês!
          </Text>
        </HStack>
      </Box>

      <ScrollView flex={1} showsVerticalScrollIndicator={false}>
        <Box bg="$backgroundDark800" p="$4" rounded="$lg" mb="$4">
          <Text 
            color="$textLight400" 
            fontSize="$lg"
            mb="$2" 
            lineHeight="$xl" 
            fontFamily="$heading"
          >
            Filtrar por Período:
          </Text>
          <Select 
            selectedValue={selectedPeriod} 
            onValueChange={setSelectedPeriod}
          >
            <SelectTrigger>
              <SelectInput placeholder="Selecione um período" color="$textLight400" />
              <SelectIcon as={CircleCheckBig} size="sm" color="$white" px="$4" />
            </SelectTrigger>
            <SelectPortal>
              <SelectBackdrop />
              <SelectContent bg="$backgroundDark800" rounded="$lg" p="$4">
                <SelectItem label="Diário" value="Diário" />
                <SelectItem label="Semanal" value="Semanal" />
                <SelectItem label="Mensal" value="Mensal" />
              </SelectContent>
            </SelectPortal>
          </Select>
        </Box>

        <Box bg="$backgroundDark800" p="$4" rounded="$lg" mb="$4">
          <Text color="$textLight400" fontSize="$lg" mb="$2">
            Métricas:
          </Text>
          <HStack justifyContent="space-between">
            <Center>
              <Icon as={ArrowDownToLine} size="md" color="$blue500" />
              <Text color="$textLight400">Entradas:</Text>
              <Text color="$textLight400" fontWeight="$bold">R$ {totalSales.toFixed(2)}</Text>
            </Center>
            <Center>
              <Icon as={ArrowUpToLine} size="md" color="$red500" />
              <Text color="$textLight400">Saídas:</Text>
              <Text color="$textLight400" fontWeight="$bold">R$ {totalCost.toFixed(2)}</Text>
            </Center>
            <Center>
              <Icon as={ChartColumnBig} size="md" color="$green500" />
              <Text color="$textLight400">Lucro:</Text>
              <Text color="$textLight400" fontWeight="$bold">R$ {totalProfit.toFixed(2)}</Text>
            </Center>
          </HStack>
        </Box>

        <PieChart
          data={pieChartData}
          width={Dimensions.get("window").width - 32}
          height={220}
          chartConfig={{
            color: (opacity = 1) => `rgba(255, 255, 255, ${opacity})`,
            labelColor: () => "#FFFFFF",
          }}
          accessor="value"
          backgroundColor="transparent"
          paddingLeft="15"
          center={[0, 0]}
        />

        <Text color="$textLight400" fontSize="$lg" mt="$4" mb="$2">Performance Mensal:</Text>
        <LineChart
          data={lineChartData}
          width={Dimensions.get("window").width - 32}
          height={220}
          chartConfig={{
            backgroundGradientFrom: "#1E2923",
            backgroundGradientTo: "#08130D",
            color: (opacity = 1) => `rgba(26, 255, 146, ${opacity})`,
            labelColor: () => "#FFFFFF",
          }}
          bezier
          style={{ borderRadius: 8 }}
        />
      </ScrollView>
    </VStack>
  );
}
