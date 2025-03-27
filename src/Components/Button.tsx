import { ComponentProps } from 'react';
import { Button as GluestackButton, Text, ButtonSpinner } from '@gluestack-ui/themed';

type Props = ComponentProps<typeof GluestackButton> & {
  title: string
  isLoading?: boolean
}

export function Button({ title, isLoading = false, ...rest }: Props) {
  return (
    <GluestackButton 
      w="$full"
      h="$14"
      bg="$purple700"
      rounded="$xl"
      $active-bg="$purple800"
      disabled={isLoading}
      {...rest}
    >
      {
        isLoading ? (
          <ButtonSpinner color="$textLight400" size="small" />
        ) : (
          <Text 
          color="$textLight400" 
          fontSize="$lg" 
          fontFamily="$heading"
        >
          {title}
      </Text>
    )}
    </GluestackButton>
  )
}