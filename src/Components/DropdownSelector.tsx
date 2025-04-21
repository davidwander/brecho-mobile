import {
  Select,
  SelectTrigger,
  SelectInput,
  SelectPortal,
  SelectBackdrop,
  SelectContent,
  SelectDragIndicatorWrapper,
  SelectItem,
} from '@gluestack-ui/themed';

export const PIECES = [
  "Blusa", "Camisa", "Camiseta", "T-Shirt", "Top", "Saia", "Short",
  "Calça", "Vestido", "Calçados", "Acessórios"
];

interface DropdownSelectorProps {
  value: string;
  onChange: (item: string) => void;
  error?: boolean;
  pieces: string[];
  onOpen?: () => void;
  dropdownReady: boolean;
}

export function DropdownSelector({
  value,
  onChange,
  error,
  pieces,
  onOpen,
  dropdownReady,
}: DropdownSelectorProps) {
  return (
    <Select
      selectedValue={value}
      onValueChange={onChange}
      onOpen={onOpen}
    >
      <SelectTrigger 
        variant="outline" 
        size="md"
        h="$14"
        rounded="$xl"
        borderColor={error ? "$red500" : "$purple700"}
      >
        <SelectInput
          placeholder="Escolha a peça"
          color="$white"
        />
      </SelectTrigger>
      <SelectPortal>
        <SelectBackdrop />
        {dropdownReady && (
          <SelectContent
            bg="$trueGray700"
            width="100%"
            borderRadius="$lg"
          >
            <SelectDragIndicatorWrapper alignItems="center" />
            {pieces.map((p) => (
              <SelectItem
                key={p}
                value={p.toLowerCase()}
                label={p}
                bg="$gray600"
                sx={{ _text: { color: "$white" } }}
              />
            ))}
          </SelectContent>
        )}
      </SelectPortal>
    </Select>
  );
}
