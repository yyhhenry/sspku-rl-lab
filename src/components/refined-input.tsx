import { Input } from "@/components/ui/input";
import { useEffect, useState } from "react";

export function NumberInput({
  value,
  setValue,
  step,
  ...props
}: {
  value: number;
  setValue: (v: number) => void;
  step?: number;
} & React.ComponentProps<typeof Input>) {
  const [inputValue, setInputValue] = useState(value.toString());
  useEffect(() => {
    setInputValue(value.toString());
  }, [value]);
  return (
    <Input
      type="number"
      value={inputValue}
      onChange={e => setInputValue(e.target.value)}
      onBlur={() => setValue(Number(inputValue))}
      step={step}
      {...props}
    />
  );
}
