<script setup lang="ts">
import {
  gridActionEnum,
  gridActionIcon,
  gridCellColor,
  GridEnvSchema,
  gridEnvStorage,
  type GridAction,
  type GridEnv,
} from '@/lib/grid-env'
import { refDebounced } from '@vueuse/core'
import { ref } from 'vue'
import z from 'zod'

const env = ref<GridEnv>(gridEnvStorage.value)
const debouncedEnv = refDebounced(env, 200)

const errorMsg = ref<string>()

// validate and persist
import { Button } from '@/components/ui/button'
import { watchEffect } from 'vue'
watchEffect(() => {
  const parsed = GridEnvSchema.safeParse(debouncedEnv.value)
  if (!parsed.success) {
    errorMsg.value = z.prettifyError(parsed.error)
    return
  }
  errorMsg.value = undefined
  // persist
  gridEnvStorage.value = parsed.data
})

const actions = gridActionEnum as unknown as GridAction[]

function cycleAction(r: number, c: number) {
  const cur = env.value.policy?.[r]?.[c] ?? 'stay'
  const idx = actions.indexOf(cur)
  const next = actions[(idx + 1) % actions.length]
  if (!env.value.policy || !env.value.policy[r]) return
  env.value.policy[r]![c] = next as GridAction
}

function resetPolicy() {
  env.value.policy = Array.from({ length: env.value.rows }, () =>
    Array.from({ length: env.value.cols }, () => 'stay'),
  )
}
</script>

<template>
  <div class="flex justify-center">
    <div class="rounded-lg border p-4 bg-white/5 w-180">
      <div class="flex items-center gap-4 mb-3">
        <Button variant="destructive" @click="resetPolicy"> Reset Policy </Button>
      </div>

      <div>
        <div class="text-sm font-bold mb-2">Grid</div>
        <table class="border-collapse">
          <tbody>
            <tr v-for="(row, r) in env.cells" :key="r">
              <td v-for="(cell, c) in row" :key="c" class="p-0">
                <div
                  :title="`r:${r} c:${c} -> ${cell}`"
                  :class="[
                    'w-10 h-10 flex items-center justify-center border cursor-pointer select-none hover:border-2 hover:border-blue-400 border transition-all duration-150',
                    gridCellColor[cell],
                  ]"
                >
                  <span>
                    <component
                      :is="gridActionIcon[env.policy?.[r]?.[c] ?? 'stay']"
                      @click="cycleAction(r, c)"
                      class="w-6 h-6 cursor-pointer"
                    />
                  </span>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <div class="mt-2 text-xs text-muted-foreground">
        Click a cell to cycle actions: stay → right → down → left → up
      </div>

      <template v-if="errorMsg !== undefined">
        <div class="mt-2 text-sm text-red-500">{{ errorMsg }}</div>
      </template>
    </div>
  </div>
</template>
