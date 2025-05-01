import React, { forwardRef } from 'react';
import { TextInputProps } from 'react-native';
import  MaskInput, { Mask } from 'react-native-mask-input';
import {
  Input as GluestackInput,
  InputField,
  FormControl,
  FormControlError,
  FormControlErrorText,
} from '@gluestack-ui/themed';

type InputProps = {
  errorMessage?: string | null;
  isReadOnly?: boolean;
  mask?: Mask;
  onMaskedTextChanged?: (masked: string, unmasked: string) => void;
} & TextInputProps;

export const Input = forwardRef<any, InputProps>(
  ({ errorMessage = null, isReadOnly = false, mask, onMaskedTextChanged, onChangeText, ...rest }, ref) => {
    const invalid = !!errorMessage;
    const { value, onChange, ...inputRest } = rest;

    return (
      <FormControl isInvalid={invalid} w="$full">
        <GluestackInput
          isInvalid={invalid}
          isReadOnly={isReadOnly}
          bg="$borderDark800"
          h="$14"
          px="$4"
          borderWidth="$0"
          rounded="$2xl"
          $focus={{
            borderWidth: 1,
            borderColor: invalid ? "$red500" : "$purple700"
          }}
          $invalid={{
            borderWidth: 1,
            borderColor: "$red500"
          }}
        >
          {mask ? (
            <MaskInput
              ref={ref}
              mask={mask}
              keyboardType={mask ? "numeric" : "default"}
              placeholderTextColor="#A1A1AA"
              style={{
                flex: 1,
                backgroundColor: 'transparent',
                color: '#E5E5E5',
                fontFamily: 'Roboto_400Regular',
                fontSize: 16,
                height: 56,
                paddingHorizontal: 16,
                borderRadius: 16,
              }}
              onChangeText={(masked, unmasked) => {
                if (onMaskedTextChanged) {
                  onMaskedTextChanged(masked, unmasked);
                } else if (onChangeText) {
                  onChangeText(masked);
                }
              }}
              {...rest}
            />
          ) : (
            <InputField
              color="$textLight400"
              fontFamily="$body"
              placeholderTextColor="$textLight400"
              value={value}
              onChangeText={onChangeText}
              {...inputRest}
            />
          )}

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
);

export default Input;
