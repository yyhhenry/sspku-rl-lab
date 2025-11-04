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
      <div class="flex items-center justify-end gap-4 mb-3">
        <AlertDialog>
          <AlertDialogTrigger as-child>
            <Button variant="destructive">Reset Policy</Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Reset Policy?</AlertDialogTitle>
              <AlertDialogDescription> All cell actions will be reset. </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction @click="resetPolicy()"> Reset </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>

      <div class="flex justify-center">
        <div>
          <div class="text-sm font-bold mb-2">Grid</div>
          <table class="border-collapse">
            <tbody>
              <tr v-for="(row, r) in env.cells" :key="r">
                <td v-for="(cell, c) in row" :key="c" class="p-0">
                  <div
                    @click="cycleAction(r, c)"
                    :title="`r:${r} c:${c} -> ${cell}`"
                    :class="[
                      'w-10 h-10 flex items-center justify-center border cursor-pointer select-none hover:border-2 hover:border-blue-400 border transition-all duration-150',
                      gridCellColor[cell],
                    ]"
                  >
                    <span>
                      <component
                        :is="gridActionIcon[env.policy?.[r]?.[c] ?? 'stay']"
                        class="w-6 h-6 cursor-pointer"
                      />
                    </span>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
      <div class="flex justify-center">
        <div class="mt-2 text-xs text-muted-foreground">
          Click a cell to cycle actions: stay → right → down → left → up
        </div>
      </div>
    </div>
  </div>
</template>
