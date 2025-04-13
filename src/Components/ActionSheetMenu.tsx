import { Actionsheet, ActionsheetBackdrop, ActionsheetContent, ActionsheetItem, HStack, Box } from '@gluestack-ui/themed';
import { ClipboardList, DollarSign, Calendar } from 'lucide-react-native';

interface ActionSheetMenuProps {
  isOpen: boolean;
  onClose: () => void;
  sheetReady: boolean;
}

export function ActionSheetMenu({ isOpen, onClose, sheetReady }: ActionSheetMenuProps) {
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
            {[ClipboardList, DollarSign, Calendar].map((Icon, index) => (
              <ActionsheetItem 
                key={index}
                w={80} 
                h={80} 
                p="$2" 
                justifyContent="center"
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
