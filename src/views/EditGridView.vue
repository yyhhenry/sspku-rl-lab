<script setup lang="ts">
import Button from '@/components/ui/button/Button.vue'
import Input from '@/components/ui/input/Input.vue'
import Textarea from '@/components/ui/textarea/Textarea.vue'
import type { GridCell } from '@/lib/rl-env'
import { createDefaultGridEnv, gridCellEnum, GridEnvSchema, gridEnvStorage } from '@/lib/rl-env'
import { refDebounced } from '@vueuse/core'
import { computed, ref, watchEffect } from 'vue'
import { toast } from 'vue-sonner'

const gridCellColor: Record<GridCell, string> = {
  empty: 'bg-white/5',
  forbidden: 'bg-yellow-600',
  goal: 'bg-indigo-600',
}

const jsonString = computed(() => {
  return JSON.stringify(gridEnvStorage.value)
})

const env = ref(gridEnvStorage.value)

const debouncedEnv = refDebounced(env, 300)

const errorMsg = ref<string>()

watchEffect(() => {
  const parsedEnv = GridEnvSchema.safeParse(debouncedEnv.value)
  if (!parsedEnv.success) {
    errorMsg.value = parsedEnv.error.message
    return
  }
  errorMsg.value = undefined
  gridEnvStorage.value = parsedEnv.data
})

function resetAll() {
  env.value = createDefaultGridEnv()
}

function setSize(rows: number, cols: number) {
  const newRows = Math.max(1, Math.floor(rows))
  const newCols = Math.max(1, Math.floor(cols))
  const old = env.value
  const newCells: GridCell[][] = []
  for (let r = 0; r < newRows; r++) {
    const row: GridCell[] = []
    for (let c = 0; c < newCols; c++) {
      row.push(old.cells?.[r]?.[c] ?? 'empty')
    }
    newCells.push(row)
  }
  env.value.rows = newRows
  env.value.cols = newCols
  env.value.cells = newCells
}

function cycleCell(r: number, c: number) {
  const order: GridCell[] = ['empty', 'forbidden', 'goal']
  const cur = env.value.cells?.[r]?.[c] ?? 'empty'
  const idx = order.indexOf(cur)
  const next = order[(idx + 1) % order.length] as GridCell
  if (!env.value.cells || !env.value.cells[r]) return
  env.value.cells[r]![c] = next
}

async function copyJson() {
  try {
    await navigator.clipboard.writeText(jsonString.value)
    toast.success('Copied JSON to clipboard')
  } catch (e) {
    toast.error('Failed to copy')
  }
}
</script>

<template>
  <div class="flex justify-center">
    <div class="rounded-lg border p-4 bg-white/5 w-160">
      <div class="flex gap-4 items-center justify-between">
        <div>
          <Button variant="destructive" @click="resetAll()">Reset All</Button>
        </div>
        <div class="flex items-center gap-4">
          <span class="flex items-center gap-2">
            <label class="text-sm">Rows</label>
            <Input
              type="number"
              v-model.number="env.rows"
              @change="setSize(env.rows, env.cols)"
              class="w-20"
            />
          </span>
          <span class="flex items-center gap-2">
            <label class="text-sm">Cols</label>
            <Input
              type="number"
              v-model.number="env.cols"
              @change="setSize(env.rows, env.cols)"
              class="w-20"
            />
          </span>
        </div>
      </div>

      <div class="mt-4 flex justify-between gap-6">
        <!-- reward editor -->
        <div class="flex-1">
          <div class="text-sm font-bold mb-2">Rewards</div>
          <div class="grid grid-cols-2 gap-2">
            <div class="flex items-center gap-2">
              <label class="text-sm">Gamma</label>
              <Input type="number" step="0.01" v-model.number="env.reward.gamma" class="w-24" />
            </div>
          </div>

          <div class="mt-3">
            <div class="text-xs text-muted-foreground mb-1">Enter cell rewards</div>
            <div class="flex flex-col gap-2">
              <div class="flex items-center gap-2" v-for="t in gridCellEnum" :key="t">
                <div class="w-24 text-sm capitalize flex items-center gap-2">
                  <div :class="['inline-block w-4 h-4 ml-2 rounded-full', gridCellColor[t]]"></div>
                  <span>{{ t }}</span>
                </div>
                <Input type="number" step="0.01" v-model.number="env.reward.cell[t]" class="w-32" />
              </div>
            </div>
          </div>
        </div>
        <!-- preview table -->
        <div>
          <div class="text-sm font-bold mb-2">Preview</div>
          <table class="border-collapse">
            <tbody>
              <tr v-for="(row, r) in env.cells" :key="r">
                <td v-for="(cell, c) in row" :key="c" class="p-0">
                  <div
                    @click="cycleCell(r, c)"
                    :title="`r:${r} c:${c} -> ${cell}`"
                    :class="[
                      'w-10 h-10 flex items-center justify-center border cursor-pointer select-none',
                      gridCellColor[cell],
                    ]"
                  ></div>
                </td>
              </tr>
            </tbody>
          </table>
          <div class="mt-2 text-xs text-muted-foreground">
            Click a cell to cycle: empty → forbidden → goal
          </div>
        </div>
      </div>

      <div class="mt-2 text-xs text-red-500" v-if="errorMsg">
        <span>{{ errorMsg }}</span>
      </div>
      <div class="mt-4 w-full">
        <div class="flex items-center justify-between">
          <div class="text-sm font-medium">JSON</div>
          <Button size="sm" @click="copyJson">Copy</Button>
        </div>
        <Textarea readonly :modelValue="jsonString" class="h-48 mt-2 text-xs" />
      </div>
    </div>
  </div>
</template>
