import { useAtom } from "jotai/react";
import { atomWithStorage } from "jotai/utils";
import { toast } from "sonner";
import { ZodType } from "zod";

export const storagePrefix = "sspku-rl-lab:";

export function createZodStore<T>(
  key: string,
  schema: ZodType<T>,
  createDefault: () => T
) {
  const baseAtom = atomWithStorage<{
    value: T;
  }>(storagePrefix + key, {
    value: createDefault(),
  });
  const useZodStore = () => {
    const [stored, setStored] = useAtom(baseAtom);
    const setWithValidation = (newValue: T) => {
      const parsed = schema.safeParse(newValue);
      if (parsed.success) {
        setStored({ value: parsed.data });
      } else {
        toast.error(`Failed to save ${key}: invalid data format.`);
      }
    };
    const getWithValidation = (): T => {
      try {
        return schema.parse(stored.value);
      } catch {
        toast.error(`Failed to retrieve ${key}: invalid data format.`);
        return createDefault();
      }
    };
    return [getWithValidation(), setWithValidation] as const;
  };
  return useZodStore;
}
