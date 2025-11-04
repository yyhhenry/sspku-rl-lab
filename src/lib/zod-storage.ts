import { useStorage } from '@vueuse/core'
// no direct Vue ref needed here; useStorage returns a Ref<T>
import z, { ZodType } from 'zod'

export const storagePrefix = 'sspku-rl-lab:'

export function safeJsonParse<T>(schema: ZodType<T>, jsonString: string) {
  try {
    const parsed = JSON.parse(jsonString)
    const result = schema.safeParse(parsed)
    if (result.success) {
      return result.data
    } else {
      return
    }
  } catch {
    return
  }
}
export function safeJsonParseWithDefault<T>(
  schema: ZodType<T>,
  jsonString: string,
  createDefault: () => T,
) {
  const parsed = safeJsonParse(schema, jsonString)
  return parsed === undefined ? createDefault() : parsed
}

export function useZodStorage<T>(key: string, schema: ZodType<T>, createDefault: () => T) {
  const storageKey = storagePrefix + key
  const WrappedSchema = z.object({ value: schema })
  const storage = useStorage<T>(storageKey, createDefault(), undefined, {
    serializer: {
      read: (raw) => {
        return safeJsonParse(WrappedSchema, raw)?.value ?? createDefault()
      },
      write: (v: T) => {
        const parsed = WrappedSchema.parse({ value: v })
        return JSON.stringify(parsed)
      },
    },
  })

  return storage
}
