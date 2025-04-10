import { VStack, Image, Center, Heading, Text, ScrollView } from '@gluestack-ui/themed';
import { useNavigation } from '@react-navigation/native';
import { useForm, Controller } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';

import BackgroundImg from '@assets/background.png';
import Logo from '@assets/vb-logo.png';

import { Input } from '@components/Input';
import { Button } from '@components/Button';

type FormDataProps = {
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
};

const signUpSchema = yup.object({
  name: yup.string().required("Informe o nome"),
  email: yup.string().required("Informe o e-mail").email("E-mail inválido"),
  password: yup.string().required("Informe a senha"),
  confirmPassword: yup.string().required("Confirme a senha"),

});

export function SignUp() {

  const { control, handleSubmit, formState: { errors } } = useForm<FormDataProps>({
    resolver: yupResolver(signUpSchema),
  });

  const navigation = useNavigation();

  function handleGoBack() {
    navigation.goBack()
  };

  function handleSignUp({ name, email, password, confirmPassword }: FormDataProps) {
    console.log({ name, email, password, confirmPassword })
  };

  return (
    <ScrollView 
      contentContainerStyle={{ flexGrow: 1 }}
      showsVerticalScrollIndicator={false}
    >
      <VStack flex={1} bg="$textDark800">
        <Image 
          w="$full"
          h={624}
          source={BackgroundImg} 
          defaultSource={BackgroundImg}
          alt="Imagem de fundo" 
          position="absolute"
        />

        <VStack flex={1} px="$10" pb="$16">
          <Center my="$20" >
            <Image 
              source={Logo} 
              rounded="$full" 
              alt="Logotipo brecho Vitoriano" 
            />

            <Text color="$purple500" fontSize="$sm" lineHeight="$xl">
              App Gerenciador E-commerce
            </Text>
          </Center>

          <Center gap="$2" flex={1}>
            <Heading color="$textLight400">
              Criar conta
            </Heading>

            <Controller 
              control={control}
              name="name"
              render={({ field: { onChange, value }}) => {
                return (
                  <Input 
                    placeholder="Nome" 
                    onChangeText={onChange}
                    value={value}
                    errorMessage={errors.name?.message}
                  />
                );
              }}
            />

            <Controller 
              control={control}
              name="email"
              render={({ field: { onChange, value }}) =>{
                return(
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
              control={control}
              name="password"
              render={({ field: { onChange, value }}) => {
                return (
                  <Input 
                    placeholder="Senha" 
                    secureTextEntry 
                    onChangeText={onChange}
                    value={value}
                    errorMessage={errors.password?.message}
                  />
                )
              }}
            />

            <Controller 
              control={control}
              name="confirmPassword"
              render={({ field: { onChange, value }}) => {
                return (
                  <Input 
                    placeholder="Confirmar senha" 
                    secureTextEntry 
                    onChangeText={onChange}
                    value={value}
                    errorMessage={errors.confirmPassword?.message}
                    onSubmitEditing={handleSubmit(handleSignUp)}
                    returnKeyType="send"
                  />
                )
              }}
            />

            <Button 
              title="Criar e entrar" 
              onPress={handleSubmit(handleSignUp)}
            />
          </Center>

          <Button 
            title="Voltar para o login" 
            variant="outline" 
            mt="$12" 
            onPress={handleGoBack}
          />
        </VStack>
      </VStack>
    </ScrollView>
  )
}