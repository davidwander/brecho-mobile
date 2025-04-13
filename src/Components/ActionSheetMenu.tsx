// ActionSheetMenu.tsx
import { useNavigation } from '@react-navigation/native';
import { Actionsheet, ActionsheetBackdrop, ActionsheetContent, ActionsheetItem, HStack, Box } from '@gluestack-ui/themed';
import { ClipboardList, DollarSign, Calendar } from 'lucide-react-native';
import { AppNavigatorRoutesProps } from '../routes/app.routes'; // ajuste o caminho conforme seu projeto

interface ActionSheetMenuProps {
  isOpen: boolean;
  onClose: () => void;
  sheetReady: boolean;
}

export function ActionSheetMenu({ isOpen, onClose, sheetReady }: ActionSheetMenuProps) {
  const navigation = useNavigation<AppNavigatorRoutesProps>();

  // Ícones com suas respectivas rotas
  const icons = [
    { icon: ClipboardList, route: 'shipments' },
    { icon: DollarSign, route: 'newRegister' },
    { icon: Calendar, route: 'profile' },
  ];

  return (
    <Actionsheet isOpen={isOpen} onClose={onClose}>
      <ActionsheetBackdrop />
      {sheetReady && (
        <ActionsheetContent 
          bg="$trueGray600" 
          rounded="$2xl" 
          p="$8"
          minHeight={150}
        >
          <HStack 
            flexWrap="wrap" 
            justifyContent="space-evenly"
            alignItems="center"
            gap="$2"
            opacity={sheetReady ? 1 : 0}
            pointerEvents={sheetReady ? 'auto' : 'none'}
          >
            {icons.map(({ icon: Icon, route }, index) => (
              <ActionsheetItem 
                key={index}
                w={80} 
                h={80} 
                p="$2" 
                justifyContent="center"
                onPress={() => {
                  onClose();           // fecha o action sheet
                  navigation.navigate(route as any); // navega para a rota
                }}
              >
                <Box 
                  borderWidth={1}
                  borderColor="$purple500"
                  w={80}
                  h={80}
                  rounded="$xl"
                  alignItems="center"
                  justifyContent="center"
                >
                  <Icon color="#fff" size={36} />
                </Box>
              </ActionsheetItem>
            ))}
          </HStack>
        </ActionsheetContent>
      )}
    </Actionsheet>
  );
}
