import { ComponentProps } from 'react';
import { Input as GluestackInput, InputField } from '@gluestack-ui/themed';

type Props = ComponentProps<typeof InputField>

export function Input({ ...rest}: Props) {
  return(
    <GluestackInput 
      bg="$borderDark800"
      h="$14"
      px="$4"
      borderWidth="$0"
      rounded="$xl"
    >
      <InputField 
        color="$textLight400"
        fontFamily="$body"
        placeholderTextColor="$textLight400"
        {...rest} 
      />
    </GluestackInput>
  )
}