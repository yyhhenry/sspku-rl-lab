import { Input } from "@/components/ui/input";
import { useEffect, useState } from "react";

export function InputOnBlur({
  value,
  setValue,
  ...props
}: {
  value: number | string;
  setValue: (v: string) => void;
} & React.ComponentProps<typeof Input>) {
  const [inputValue, setInputValue] = useState(value.toString());
  useEffect(() => {
    setInputValue(value.toString());
  }, [value]);
  return (
    <Input
      value={inputValue}
      onChange={e => setInputValue(e.target.value)}
      onBlur={() => setValue(inputValue)}
      {...props}
    />
  );
}
