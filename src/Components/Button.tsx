import { ComponentProps } from 'react';
import { Button as GluestackButton, Text, ButtonSpinner } from '@gluestack-ui/themed';

type Props = ComponentProps<typeof GluestackButton> & {
  title: string
  variant?: "solid" | "outline" 
  isLoading?: boolean
}

export function Button({ 
  title, 
  variant = "solid", 
  isLoading = false, 
  ...rest 
}: Props) {
  return (
    <GluestackButton 
      w="$full"
      h="$14"
      bg={variant === "outline" ? "transparent" : "$purple700"}
      borderWidth={variant === "outline" ? "$1" : "$0"}
      borderColor="$purple700"
      rounded="$xl"
      $active-bg={variant === "outline" ? "$light900" : "$purple900"}
      disabled={isLoading}
      {...rest}
    >
      {
        isLoading ? (
          <ButtonSpinner color="$textLight400" size="large" />
        ) : (
          <Text 
          color={variant === "outline" ? "$purple500" : "$textLight400" }
          fontSize="$lg" 
          fontFamily="$heading"
          lineHeight="$xl"
        >
          {title}
      </Text>
    )}
    </GluestackButton>
  )
}