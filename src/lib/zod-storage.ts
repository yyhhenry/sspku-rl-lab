import { useStorage } from '@vueuse/core'
import cloneDeep from 'lodash/cloneDeep'
import { computed } from 'vue'
import z, { ZodType } from 'zod'

export const storagePrefix = 'sspku-rl-lab:'

export function safeJsonParse<T>(schema: ZodType<T>, jsonString: string) {
  try {
    const parsed = JSON.parse(jsonString)
    const result = schema.safeParse(parsed)
    if (result.success) {
      return result.data
    } else {
      console.error(`Failed to parse JSON string:`, result.error)
      return
    }
  } catch {
    return
  }
}
export function safeJsonParseWithDefault<T>(
  schema: ZodType<T>,
  jsonString: string,
  defaultValue: T,
) {
  const parsed = safeJsonParse(schema, jsonString)
  return parsed === undefined ? cloneDeep(defaultValue) : parsed
}

export function useZodStorage<T>(key: string, schema: ZodType<T>) {
  const WrappedSchema = z.object({ data: schema.optional() })
  const storage = useStorage(`${storagePrefix}${key}`, JSON.stringify({}))

  const parsed = computed({
    get() {
      return storage.value === undefined
        ? undefined
        : safeJsonParse(WrappedSchema, storage.value)?.data
    },
    set(value: T | undefined) {
      storage.value = JSON.stringify(WrappedSchema.parse({ data: value }))
    },
  })

  return parsed
}
export function useZodStorageWithDefault<T>(key: string, schema: ZodType<T>, defaultValue: T) {
  const rawZodStorage = useZodStorage<T>(key, schema)

  const parsed = computed({
    get() {
      return rawZodStorage.value === undefined ? cloneDeep(defaultValue) : rawZodStorage.value
    },
    set(value: T) {
      rawZodStorage.value = schema.parse(value)
    },
  })

  return parsed
}
