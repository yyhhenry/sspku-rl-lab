<script setup lang="ts">
import Button from '@/components/ui/button/Button.vue'
import Input from '@/components/ui/input/Input.vue'
import type { GridCell, GridEnv, GridReward } from '@/lib/rl-env'
import { gridCellEnum, GridCellSchema, GridEnvSchema, GridRewardSchema } from '@/lib/rl-env'
import { useZodStorageWithDefault } from '@/lib/zod-storage'
import { computed, ref } from 'vue'
import { toast } from 'vue-sonner'

const gridCellColor: Record<GridCell, string> = {
  empty: 'bg-white/5',
  forbidden: 'bg-yellow-600',
  goal: 'bg-indigo-600',
}

const defaultEnv: GridEnv = {
  rows: 5,
  cols: 5,
  cells: [
    ['empty', 'empty', 'empty', 'empty', 'empty'],
    ['empty', 'forbidden', 'forbidden', 'empty', 'empty'],
    ['empty', 'empty', 'forbidden', 'empty', 'empty'],
    ['empty', 'forbidden', 'goal', 'forbidden', 'empty'],
    ['empty', 'forbidden', 'empty', 'empty', 'empty'],
  ],
}

const defaultReward: GridReward = {
  gamma: 0.9,
  cell: {
    empty: 0,
    forbidden: -1,
    goal: 1,
  },
}

const envStorage = useZodStorageWithDefault('grid.env', GridEnvSchema, defaultEnv)
const rewardStorage = useZodStorageWithDefault('grid.reward', GridRewardSchema, defaultReward)

const jsonString = computed(() => {
  return JSON.stringify({
    env: envStorage.value,
    reward: rewardStorage.value,
  })
})

const env = ref(envStorage.value)
const reward = ref(rewardStorage.value)

function resetAll() {
  env.value = defaultEnv
  reward.value = defaultReward
  persistEnv()
  persistReward()
}
// keep storage in sync
function persistEnv() {
  envStorage.value = env.value
}
function persistReward() {
  rewardStorage.value = reward.value
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
  env.value = { rows: newRows, cols: newCols, cells: newCells }
  persistEnv()
}

function cycleCell(r: number, c: number) {
  const order: GridCell[] = ['empty', 'forbidden', 'goal']
  const cur = env.value.cells?.[r]?.[c] ?? 'empty'
  const idx = order.indexOf(cur)
  const next = order[(idx + 1) % order.length] as GridCell
  if (!env.value.cells || !env.value.cells[r]) return
  env.value.cells[r]![c] = next
  persistEnv()
}

async function copyJson() {
  try {
    await navigator.clipboard.writeText(jsonString.value)
    // optimistic small feedback via alert (keeps this component self-contained)
    // In the app you'd use sonner/toaster; keep minimal here.
    // eslint-disable-next-line no-alert
    alert('Copied JSON to clipboard')
  } catch (e) {
    // eslint-disable-next-line no-alert
    alert('Failed to copy')
  }
}

function updateGamma(val: number) {
  reward.value.gamma = Math.max(0, Math.min(1, val))
  persistReward()
}

function updateCellReward(type: string, val: number) {
  const parsedType = GridCellSchema.safeParse(type)
  if (!parsedType.success) {
    toast.error(`Invalid cell type: ${type}`)
    return
  }
  reward.value.cell[parsedType.data] = val
  persistReward()
}
</script>

<template>
  <div class="rounded-lg border p-4 bg-white/5">
    <div class="flex gap-4 items-end">
      <div>
        <Button @click="resetAll()">Reset All</Button>
      </div>
      <div class="flex items-center gap-2">
        <label class="text-sm">Rows</label>
        <Input
          type="number"
          v-model.number="env.rows"
          @change="setSize(env.rows, env.cols)"
          class="w-20"
        />
      </div>
      <div class="flex items-center gap-2">
        <label class="text-sm">Cols</label>
        <Input
          type="number"
          v-model.number="env.cols"
          @change="setSize(env.rows, env.cols)"
          class="w-20"
        />
      </div>
    </div>

    <div class="mt-4 flex gap-6">
      <!-- preview table -->
      <div>
        <div class="text-sm font-medium mb-2">Preview</div>
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

      <!-- reward editor -->
      <div class="flex-1">
        <div class="text-sm font-medium mb-2">Rewards</div>
        <div class="grid grid-cols-2 gap-2">
          <div class="flex items-center gap-2">
            <label class="text-sm">Gamma</label>
            <Input
              type="number"
              step="0.01"
              v-model.number="reward.gamma"
              @change="updateGamma(reward.gamma)"
              class="w-24"
            />
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
              <Input
                type="number"
                step="0.01"
                v-model.number="reward.cell[t]"
                @change="updateCellReward(t, reward.cell[t])"
                class="w-32"
              />
            </div>
          </div>
        </div>
      </div>
    </div>

    <div class="mt-4 w-200">
      <div class="flex items-center justify-between">
        <div class="text-sm font-medium">JSON</div>
        <Button size="sm" @click="copyJson">Copy</Button>
      </div>
      <textarea
        readonly
        class="w-full h-48 mt-2 p-2 bg-gray-900 text-white text-xs rounded"
        :value="jsonString"
      ></textarea>
    </div>
  </div>
</template>
