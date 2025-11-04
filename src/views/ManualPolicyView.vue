<script setup lang="ts">
import { Empty, EmptyHeader, EmptyMedia, EmptyTitle } from '@/components/ui/empty'
import {
  gridActionColor,
  gridActionEnum,
  gridEnvStorage,
  GridEnvWithPolicySchema,
  type GridAction,
  type GridEnvWithPolicy,
} from '@/lib/grid-env'
import { refDebounced } from '@vueuse/core'
import { Hand } from 'lucide-vue-next'
import { ref } from 'vue'
import z from 'zod'

const env = ref<GridEnvWithPolicy>(gridEnvStorage.value)
const debouncedEnv = refDebounced(env, 200)

const errorMsg = ref<string>()

// validate and persist
import { watchEffect } from 'vue'
watchEffect(() => {
  const parsed = GridEnvWithPolicySchema.safeParse(debouncedEnv.value)
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
  <Empty>
    <EmptyHeader>
      <EmptyMedia variant="icon">
        <Hand />
      </EmptyMedia>
    </EmptyHeader>
    <EmptyTitle>Manual Policy</EmptyTitle>
    <div class="mt-4">
      <div class="flex items-center gap-4 mb-3">
        <div class="text-sm font-bold">Legend</div>
        <div class="flex items-center gap-2">
          <template v-for="a in actions" :key="a">
            <div class="flex items-center gap-2 text-xs">
              <div :class="['w-4 h-4 rounded', gridActionColor[a]]"></div>
              <div class="capitalize">{{ a }}</div>
            </div>
          </template>
        </div>
        <div class="ml-auto">
          <button class="btn btn-sm bg-red-600 text-white px-3 py-1 rounded" @click="resetPolicy">
            Reset Policy
          </button>
        </div>
      </div>

      <table class="border-collapse">
        <tbody>
          <tr v-for="(row, r) in env.cells" :key="r">
            <td v-for="(cell, c) in row" :key="c" class="p-0">
              <div
                @click="cycleAction(r, c)"
                :title="`r:${r} c:${c} -> ${env.policy?.[r]?.[c] ?? 'stay'}`"
                :class="[
                  'w-10 h-10 flex items-center justify-center border cursor-pointer select-none',
                  gridActionColor[env.policy?.[r]?.[c] ?? 'stay'] || 'bg-white/5',
                ]"
              >
                <span class="text-[10px]">{{
                  (env.policy?.[r]?.[c] ?? 'stay').slice(0, 1).toUpperCase()
                }}</span>
              </div>
            </td>
          </tr>
        </tbody>
      </table>

      <div class="mt-2 text-xs text-muted-foreground">
        Click a cell to cycle actions: stay → up → down → left → right
      </div>

      <template v-if="errorMsg !== undefined">
        <div class="mt-2 text-sm text-red-500">{{ errorMsg }}</div>
      </template>
    </div>
  </Empty>
</template>
