import React, { ComponentProps, ReactElement } from 'react';
import { Button as GluestackButton, Text, ButtonSpinner, HStack } from '@gluestack-ui/themed';

type Props = ComponentProps<typeof GluestackButton> & {
  title?: string;
  variant?: "solid" | "outline";
  isLoading?: boolean;
  icon?: ReactElement | string; 
}

export function Button({ 
  title,
  variant = "solid", 
  isLoading = false, 
  icon, 
  ...rest 
}: Props) {
  const textColor = variant === "outline" ? "$purple500" : "$textLight400";

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
          <ButtonSpinner color={textColor} size="large" />
        ) : (
          <HStack alignItems="center" justifyContent="center" space="sm">
            {icon}
            {title && (
              <Text 
                color={textColor}
                fontSize="$lg" 
                fontFamily="$heading"
                lineHeight="$xl"
              >
                {title}
              </Text>
            )}
          </HStack>
        )
      }
    </GluestackButton>
  )
}
