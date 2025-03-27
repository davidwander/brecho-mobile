import { VStack, Image } from '@gluestack-ui/themed';

import BackgroundImg from '@assets/background.png';

export function SignIn() {
  return (
    <VStack flex={1} bg="$textDark800">
      <Image 
        w="$full"
        h={624}
        source={BackgroundImg} 
        defaultSource={BackgroundImg}
        alt="Imagem de fundo" 
        position="absolute"
      />
    </VStack>
  )
}