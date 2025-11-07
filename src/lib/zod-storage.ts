import { useState } from "react";
import z, { ZodType } from "zod";

export const storagePrefix = "sspku-rl-lab:";

export function safeJsonParse<T>(
  schema: ZodType<T>,
  jsonString: string,
  createDefault: () => T
) {
  try {
    const parsed = JSON.parse(jsonString);
    const result = schema.safeParse(parsed);
    if (result.success) {
      return result.data;
    } else {
      return createDefault();
    }
  } catch {
    return createDefault();
  }
}

export function useZodStorage<T>(
  key: string,
  schema: ZodType<T>,
  createDefault: () => T
) {
  const storageKey = storagePrefix + key;
  const WrappedSchema = z.object({ value: schema });
  const createWrapped = () => ({ value: createDefault() });

  const [value, setValue] = useState<T>(() => {
    const raw = localStorage.getItem(storageKey);
    if (raw === null) {
      return createDefault();
    }
    return safeJsonParse(WrappedSchema, raw, createWrapped).value;
  });

  return [
    value,
    (newValue: T) => {
      const wrapped = { value: newValue };
      localStorage.setItem(storageKey, JSON.stringify(wrapped));
      setValue(newValue);
    },
  ] as const;
}
