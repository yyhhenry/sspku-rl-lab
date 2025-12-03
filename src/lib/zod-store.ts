import { useAtom } from "jotai/react";
import { atomWithStorage } from "jotai/utils";
import { useCallback, useMemo } from "react";
import { toast } from "sonner";
import z, { ZodType } from "zod";

export const storagePrefix = "sspku-rl-lab:";

export function createZodStore<T>(
  key: string,
  schema: ZodType<T>,
  createDefault: () => T,
) {
  const baseAtom = atomWithStorage<{
    value: T;
  }>(storagePrefix + key, {
    value: createDefault(),
  });
  const useZodStore = () => {
    const [stored, setStored] = useAtom(baseAtom);
    const value = useMemo((): T => {
      const parsed = schema.safeParse(stored.value);
      if (parsed.success) {
        return parsed.data;
      } else {
        toast.error(
          `Failed to retrieve ${key}: ${z.prettifyError(parsed.error)}`,
        );
        const value = createDefault();
        setStored({ value });
        return value;
      }
    }, [setStored, stored.value]);
    const setValue = useCallback(
      (newValue: T) => {
        const parsed = schema.safeParse(newValue);
        if (parsed.success) {
          setStored({ value: parsed.data });
        } else {
          toast.error(
            `Failed to save ${key}: ${z.prettifyError(parsed.error)}`,
          );
        }
      },
      [setStored],
    );
    return [value, setValue] as const;
  };
  return useZodStore;
}
