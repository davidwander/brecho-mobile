import { VStack, Image, Center, Heading, Text, ScrollView } from '@gluestack-ui/themed';
import { useNavigation } from '@react-navigation/native';
import { useForm, Controller } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { useState } from 'react';

import { AuthNavigatorRoutesProps } from '@routes/auth.routes';
import { useAuth } from '@contexts/AuthContext';

import BackgroundImg from '@assets/background.png';
import Logo from '@assets/vb-logo.png';

import { Input } from '@components/Input';
import { Button } from '@components/Button';
import { Alert } from 'react-native';

type FormDataProps = {
  email: string;
  password: string;
};

const signInSchema = yup.object({
  email: yup.string().required("Informe o e-mail").email("E-mail inválido"),
  password: yup.string().required("Informe a senha").min(6, "A senha deve ter no mínimo 6 dígitos"),
})

export function SignIn() {
  const [isLoading, setIsLoading] = useState(false);
  const { signIn } = useAuth();

  const { control, handleSubmit, formState: { errors } } = useForm<FormDataProps>({
    resolver: yupResolver(signInSchema),
  });

  const navigation = useNavigation<AuthNavigatorRoutesProps>();

  function handleNewAccount() {
    navigation.navigate("signUp")
  };

  async function handleSignIn({ email, password }: FormDataProps) {
    try {
      setIsLoading(true);
      await signIn({ email, password });
    } catch (error: any) {
      const message = error?.message || 'Não foi possível entrar. Tente novamente mais tarde.';
      Alert.alert('Erro no login', message);
    } finally {
      setIsLoading(false);
    }
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

            <Controller 
              name="email"
              control={control}
              render={({ field: { onChange, value }}) => {
                return (
                  <Input 
                    placeholder="E-mail" 
                    keyboardType="email-address" 
                    autoCapitalize="none" 
                    onChangeText={onChange} 
                    value={value}
                    errorMessage={errors.email?.message}
                  />
                )
              }}
            />

            <Controller 
              name="password"
              control={control}
              render={({ field: { onChange, value }}) => {
                return (
                  <Input 
                    placeholder="Senha" 
                    secureTextEntry 
                    onChangeText={onChange} 
                    value={value}
                    errorMessage={errors.password?.message}
                    onSubmitEditing={handleSubmit(handleSignIn)}
                    returnKeyType="send"
                  />
                )
              }}
            />

            <Button 
              title="Entrar" 
              onPress={handleSubmit(handleSignIn)}
              isLoading={isLoading}
            />
          </Center>

          <Center>
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
              isDisabled={isLoading}
            />
          </Center>
        </VStack>
      </VStack>
    </ScrollView>
  )
}