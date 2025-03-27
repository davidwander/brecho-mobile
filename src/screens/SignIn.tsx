import { VStack, Image, Center } from '@gluestack-ui/themed';

import BackgroundImg from '@assets/background.png';
import Logo from '@assets/vb-logo.png';

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

      <Center my="$24" >
        <Image 
          source={Logo} 
          rounded="$full" 
          alt="Logotipo brecho Vitoriano" 
        />
      </Center>
    </VStack>
  )
}