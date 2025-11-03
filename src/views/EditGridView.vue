<script setup lang="ts">
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog'
import Button from '@/components/ui/button/Button.vue'
import Input from '@/components/ui/input/Input.vue'
import { Separator } from '@/components/ui/separator'
import {
  createDefaultGridEnv,
  gridCellColor,
  gridCellEnum,
  GridEnvSchema,
  gridEnvStorage,
  type GridCell,
} from '@/lib/grid-env'
import { refDebounced } from '@vueuse/core'
import { ref, watchEffect } from 'vue'
import z from 'zod'
const env = ref(gridEnvStorage.value)

const debouncedEnv = refDebounced(env, 300)

const errorMsg = ref<string>()

watchEffect(() => {
  const parsedEnv = GridEnvSchema.safeParse(debouncedEnv.value)
  if (!parsedEnv.success) {
    errorMsg.value = z.prettifyError(parsedEnv.error)
    return
  }
  errorMsg.value = undefined
  gridEnvStorage.value = parsedEnv.data
})

function resetGridEnv() {
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

function setGamma(gamma: number) {
  env.value.reward.gamma = Math.min(0.99, Math.max(0.01, gamma))
}

function cycleCell(r: number, c: number) {
  const order: GridCell[] = ['empty', 'forbidden', 'goal']
  const cur = env.value.cells?.[r]?.[c] ?? 'empty'
  const idx = order.indexOf(cur)
  const next = order[(idx + 1) % order.length] as GridCell
  if (!env.value.cells || !env.value.cells[r]) return
  env.value.cells[r]![c] = next
}
</script>

<template>
  <div class="flex justify-center">
    <div class="rounded-lg border p-4 bg-white/5 w-180">
      <div class="flex gap-4 items-center justify-between">
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
        <div>
          <AlertDialog>
            <AlertDialogTrigger as-child>
              <Button variant="destructive">Reset Grid Env</Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Reset Grid Env?</AlertDialogTitle>
                <AlertDialogDescription> This action cannot be undone. </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction @click="resetGridEnv()"> Reset </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </div>

      <div class="mt-4 flex justify-between gap-6">
        <!-- reward editor -->
        <div>
          <div class="text-sm font-bold mb-2">Rewards</div>
          <div class="flex flex-col gap-2">
            <div class="flex items-center gap-2">
              <label class="w-28 text-sm">Gamma</label>
              <Input
                type="number"
                step="0.01"
                v-model.number="env.reward.gamma"
                @change="setGamma(env.reward.gamma)"
                class="w-32"
              />
            </div>
            <div class="flex items-center gap-2">
              <label class="w-28 text-sm">Border</label>
              <Input type="number" step="0.1" v-model.number="env.reward.border" class="w-32" />
            </div>
            <Separator />
            <div class="flex items-center gap-2" v-for="t in gridCellEnum" :key="t">
              <div class="w-28 text-sm capitalize flex items-center gap-2">
                <div :class="['inline-block w-4 h-4 ml-2 rounded-full', gridCellColor[t]]"></div>
                <span>{{ t }}</span>
              </div>
              <Input type="number" step="0.01" v-model.number="env.reward.cell[t]" class="w-32" />
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

      <template v-if="errorMsg !== undefined">
        <Separator class="my-4" />
        <div class="mt-2 text-sm text-red-500">{{ errorMsg }}</div>
      </template>
    </div>
  </div>
</template>
