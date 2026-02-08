import { useAtom } from "jotai/react";
import { atomWithStorage } from "jotai/utils";
import { atom } from "jotai/vanilla";
import { toast } from "sonner";
import z, { ZodType } from "zod";

export const storagePrefix = "sspku-rl-lab:";

export function createZodStore<T>(
  key: string,
  schema: ZodType<T>,
  createDefault: () => T,
) {
  const wrappedSchema = z.object({
    value: schema,
  });
  const baseAtom = atomWithStorage<{
    value: T;
  }>(storagePrefix + key, {
    value: createDefault(),
  });

  const zodAtom = atom(
    get => {
      const stored = get(baseAtom);
      const parsed = wrappedSchema.safeParse(stored);
      if (parsed.success) {
        return parsed.data.value;
      } else {
        toast.error(
          `Failed to retrieve ${key}: ${z.prettifyError(parsed.error)}`,
        );
        return createDefault();
      }
    },
    (_, set, newValue: T) => {
      const parsed = schema.safeParse(newValue);
      if (parsed.success) {
        set(baseAtom, { value: parsed.data });
      } else {
        toast.error(`Failed to save ${key}: ${z.prettifyError(parsed.error)}`);
      }
    },
  );

  return () => useAtom(zodAtom);
}
