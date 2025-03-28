import { 
  VStack, 
  Image, 
  Center, 
  Heading, 
  Text, 
  ScrollView 
} from '@gluestack-ui/themed';
import { useNavigation } from '@react-navigation/native';

import { AuthNavigatorRoutesProps } from '@routes/auth.routes';

import BackgroundImg from '@assets/background.png';
import Logo from '@assets/vb-logo.png';

import { Input } from '@components/Input';
import { Button } from '@components/Button';

export function SignIn() {
  const navigation = useNavigation<AuthNavigatorRoutesProps>();

  function handleNewAccount() {
    navigation.navigate("signUp")
  };

  return (
    <ScrollView 
      contentContainerStyle={{ flexGrow: 1 }}
      showsVerticalScrollIndicator={false}
    >
      <VStack flex={1}>
        <Image 
          w="$full"
          h={624}
          source={BackgroundImg} 
          defaultSource={BackgroundImg}
          alt="Imagem de fundo" 
          position="absolute"
        />

        <VStack flex={1} px="$10" pb="$16">
          <Center my="$24" >
            <Image 
              source={Logo} 
              rounded="$full" 
              alt="Logotipo brecho Vitoriano" 
            />

            <Text color="$purple500" fontSize="$sm" lineHeight="$xl">
              App Gerenciador E-commerce
            </Text>
          </Center>

          <Center gap="$2">
            <Heading color="$textLight400">
              Entrar em Vitoriano Brecho
            </Heading>

            <Input 
              placeholder="E-mail" 
              keyboardType="email-address" 
              autoCapitalize="none" 
            />

            <Input placeholder="Senha" secureTextEntry />

            <Button title="Entrar" />
          </Center>

          <Center flex={1} justifyContent="flex-end" mt="$4">
            <Text
              color="$textLight400"
              mb="$3"
              fontFamily="$body"
              fontSize="$sm"
              lineHeight="$xl"
            >
              Ainda não tem acesso?
            </Text>

            <Button 
              title="Criar conta" 
              variant="outline" 
              onPress={handleNewAccount}
            />
          </Center>
        </VStack>
      </VStack>
    </ScrollView>
  )
}