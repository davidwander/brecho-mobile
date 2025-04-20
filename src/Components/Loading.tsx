import { Center, Spinner } from "@gluestack-ui/themed";

export function Loading() {
  return (
    <Center flex={1} bg="$textDark800">
      <Spinner  color="$violet700" size="large" />
    </Center>
  )
}