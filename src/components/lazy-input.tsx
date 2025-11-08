import { ButtonGroup } from "@/components/ui/button-group";
import { Input } from "@/components/ui/input";
import { Minus, Plus } from "lucide-react";
import { useEffect, useState } from "react";
import { Button } from "./ui/button";

export function LazyInput({
  value,
  setValue,
  ...props
}: {
  value: string;
  setValue: (v: string) => void;
} & React.ComponentProps<typeof Input>) {
  const [syncTrigger, setSyncTrigger] = useState(0);
  const [inputValue, setInputValue] = useState(value);
  useEffect(() => setInputValue(value), [value, syncTrigger]);
  return (
    <Input
      value={inputValue}
      onChange={e => setInputValue(e.target.value)}
      onBlur={() => {
        setValue(inputValue);
        setSyncTrigger(v => v + 1);
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
