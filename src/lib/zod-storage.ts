import { toast } from "sonner";
import z, { ZodType } from "zod";
import { combine, persist } from "zustand/middleware";
import { createStore } from "zustand/vanilla";

export const storagePrefix = "sspku-rl-lab:";

export function useZodStore<T>(
  key: string,
  schema: ZodType<T>,
  createDefault: () => T
) {
  return createStore(
    persist(
      combine({ value: createDefault() }, set => ({
        setValue: (newValue: T) => {
          try {
            set({ value: schema.parse(newValue) });
          } catch {
            toast.error(`Failed to save ${key}: invalid data format`);
          }
        },
      })),
      {
        name: storagePrefix + key,
        migrate: (persistedState: unknown) => {
          try {
            return z.object({ value: schema }).parse(persistedState);
          } catch {
            return { value: createDefault() };
          }
        },
      }
    )
  );
}
