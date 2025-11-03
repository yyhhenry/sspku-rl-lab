import { useStorage } from '@vueuse/core'
import { isEqual } from 'lodash'
import { computed, ref, watch } from 'vue'
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
  createDefault: () => T,
) {
  const parsed = safeJsonParse(schema, jsonString)
  return parsed === undefined ? createDefault() : parsed
}

export function useZodStorage<T>(key: string, schema: ZodType<T>, createDefault: () => T) {
  const WrappedSchema = z.object({ data: schema.optional() })
  const value = ref<T>(createDefault())

  const storage = useStorage(`${storagePrefix}${key}`, '{}')
  const parsedStorage = computed({
    get() {
      return safeJsonParse(WrappedSchema, storage.value)?.data ?? createDefault()
    },
    set(newValue: T | undefined) {
      const wrapped = WrappedSchema.parse({ data: newValue })
      storage.value = JSON.stringify(wrapped)
    },
  })

  watch(
    parsedStorage,
    (newValue) => {
      if (!isEqual(newValue, value.value)) {
        value.value = newValue
      }
    },
    { immediate: true },
  )
  watch(value, (newValue) => {
    if (!isEqual(newValue, parsedStorage.value)) {
      parsedStorage.value = newValue
    }
  })

  return value
}
