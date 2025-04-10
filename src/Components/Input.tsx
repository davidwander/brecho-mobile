import { ComponentProps } from 'react';
import { 
  Input as GluestackInput, 
  InputField, 
  FormControl,
  FormControlErrorText,
  FormControlError
} from '@gluestack-ui/themed';

type Props = ComponentProps<typeof InputField> & {
  errorMessage?: string | null;
  isInvalid?: boolean;
  isReadOnly?: boolean;
}

export function Input({ 
  isReadOnly = false,
  errorMessage = null,
  isInvalid = false,
  ...rest
}: Props) {
  const invalid = !!errorMessage || isInvalid

  return(
    <FormControl 
      isInvalid={invalid}
      w="$full"
    >
      <GluestackInput 
        bg="$borderDark800"
        h="$14"
        px="$4"
        borderWidth="$0"
        rounded="$xl"
        $focus={{
          borderWidth: 1,
          borderColor: "$purple700"
        }}
      >
        <InputField 
          color="$textLight400"
          fontFamily="$body"
          placeholderTextColor="$textLight400"
          {...rest} 
        />
      </GluestackInput>

      <FormControlError>
        <FormControlErrorText color="$red500">
          {errorMessage}
        </FormControlErrorText>
      </FormControlError>
    </FormControl>
  )
}