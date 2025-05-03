import React from 'react';
import { Modal } from 'react-native';
import { Box, Text, Button } from '@gluestack-ui/themed';
import Ionicons from 'react-native-vector-icons/Ionicons'; // Importando o Ionicons

interface ProductDetailsModalProps {
  visible: boolean;
  item: any;
  onClose: () => void;
}

export default function ProductDetailsModal({
  visible,
  item,
  onClose,
}: ProductDetailsModalProps) {
  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={true}
      onRequestClose={onClose}
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
          style={{
            elevation: 5, // Para Android
            shadowColor: '#000', // Para iOS
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.8,
            shadowRadius: 3, // Ajuste conforme necessário
          }}
        >
          <Text 
            textAlign="center"
            fontSize="$2xl" 
            fontFamily="$heading" 
            color="$white" 
            mb="$4"
            lineHeight="$md"
          >
            Detalhes da Peça
          </Text>

          <Text color="$white" mb="$2" lineHeight="$md" fontSize="$md">
            Tipo: {item?.type}
          </Text>
          <Text color="$white" mb="$2" lineHeight="$md">
            Descrição: {item?.description}
          </Text>
          <Text color="$white" mb="$2" lineHeight="$md">
            COD: {item?.id}
          </Text>
          <Text color="$red400" mb="$2" lineHeight="$md">
            Preço de Custo: R$ {item?.costPrice?.toFixed(2).replace(".", ",")}
          </Text>
          <Text color="$green400" mb="$4" lineHeight="$md">
            Preço de Venda: R$ {item?.salePrice?.toFixed(2).replace(".", ",")}
          </Text>

          <Button
            w="$16"
            alignSelf="flex-end"
            bg="$purple700"
            rounded="$xl"
            onPress={onClose}
          >
            <Ionicons name="close" color="white" size={28} /> {/* Ícone de fechar usando Ionicons */}
          </Button>
        </Box>
      </Box>
    </Modal>
  );
}
