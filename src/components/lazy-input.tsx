import { ButtonGroup } from "@/components/ui/button-group";
import { Input } from "@/components/ui/input";
import { Minus, Plus } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Button } from "./ui/button";

export function LazyInput({
  value,
  setValue,
  ...props
}: {
  value: string;
  setValue: (v: string) => void;
} & React.ComponentProps<typeof Input>) {
  const [inputValue, setInputValue] = useState(value);
  useEffect(() => setInputValue(value), [value]);
  return (
    <Input
      value={inputValue}
      onChange={e => setInputValue(e.target.value)}
      onBlur={() => {
        toast.info(`Blur: inputValue=${inputValue} value=${value}`);
        setValue(inputValue);
      }}
      {...props}
    />
  );
}

export function LazyNumberInput({
  value,
  step,
  setValue,
  ...props
}: {
  value: number;
  step?: number;
  setValue: (v: number) => void;
} & React.ComponentProps<typeof Input>) {
  return (
    <ButtonGroup>
      <Button variant="outline" onClick={() => setValue(value - (step || 1))}>
        <Minus />
      </Button>
      <LazyInput
        value={String(parseFloat(value.toFixed(8)))}
        setValue={s => setValue(Number(s))}
        {...props}
      />
      <Button variant="outline" onClick={() => setValue(value + (step || 1))}>
        <Plus />
      </Button>
    </ButtonGroup>
  );
}
