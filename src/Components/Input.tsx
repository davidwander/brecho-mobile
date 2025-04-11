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
  isReadOnly?: boolean;
}

export function Input({ 
  isReadOnly = false,
  errorMessage = null,
  ...rest
}: Props) {
  const invalid = !!errorMessage;

  return (
    <FormControl isInvalid={invalid} w="$full">
      <GluestackInput
        isInvalid={invalid}
        isReadOnly={isReadOnly}
        bg="$borderDark800"
        h="$14"
        px="$4"
        borderWidth="$0"
        rounded="$xl"
        $focus={{
          borderWidth: 1,
          borderColor: invalid ? "$red500" : "$purple700"
        }}
        $invalid={{
          borderWidth: 1,
          borderColor: "$red500"
        }}
      >
        <InputField 
          color="$textLight400"
          fontFamily="$body"
          placeholderTextColor="$textLight400"
          {...rest}
        />
      </GluestackInput>

      {invalid && (
        <FormControlError>
          <FormControlErrorText color="$red500">
            {errorMessage}
          </FormControlErrorText>
        </FormControlError>
      )}
    </FormControl>
  );
}
