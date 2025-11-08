import { useAtom } from "jotai/react";
import { atomWithStorage } from "jotai/utils";
import { toast } from "sonner";
import z, { ZodType } from "zod";

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
        toast.error(`Failed to save ${key}: ${z.prettifyError(parsed.error)}`);
      }
    };
    const getWithValidation = (): T => {
      const parsed = schema.safeParse(stored.value);
      if (parsed.success) {
        return parsed.data;
      } else {
        toast.error(
          `Failed to retrieve ${key}: ${z.prettifyError(parsed.error)}`
        );
        setStored({ value: createDefault() });
        return createDefault();
      }
    };
    return [getWithValidation(), setWithValidation] as const;
  };
  return useZodStore;
}
