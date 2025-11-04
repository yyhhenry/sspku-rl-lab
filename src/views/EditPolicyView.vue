<script setup lang="ts">
import MarkedView from '@/components/MarkedView.vue'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  displaySparseBoolMatrix,
  displayVector,
  getPolicyExamples,
  getRewardTensor,
  getTransitionTensor,
  gridActionEnum,
  gridActionIcon,
  gridCellColor,
  GridEnvSchema,
  gridEnvStorage,
  type GridAction,
  type GridEnv,
} from '@/lib/grid-env'
import { refDebounced } from '@vueuse/core'
import cloneDeep from 'lodash/cloneDeep'
import { computed, ref, watchEffect } from 'vue'
import { toast } from 'vue-sonner'
import z from 'zod'

const env = ref<GridEnv>(gridEnvStorage.value)
const debouncedEnv = refDebounced(env, 200)

const activeTab = ref('original-data')
watchEffect(() => {
  const parsed = GridEnvSchema.safeParse(debouncedEnv.value)
  if (!parsed.success) {
    toast.error(z.prettifyError(parsed.error))
    return
  }
  gridEnvStorage.value = parsed.data
  activeTab.value = 'original-data'
})

const actions = gridActionEnum as unknown as GridAction[]

function cycleAction(r: number, c: number) {
  const cur = env.value.policy?.[r]?.[c] ?? 'stay'
  const idx = actions.indexOf(cur)
  const next = actions[(idx + 1) % actions.length]
  if (!env.value.policy || !env.value.policy[r]) return
  env.value.policy[r]![c] = next as GridAction
}

// Tensors for markdown display

const rewardTensor = computed(() => getRewardTensor(gridEnvStorage.value))

const transitionTensor = computed(() => getTransitionTensor(gridEnvStorage.value))

const commonMarkdown = computed(() => {
  return [
    `$v_\\pi = r_\\pi + \\gamma P_\\pi v_\\pi$`,
    `Here, $v_\\pi$ is the value function under policy $\\pi$, $r_\\pi$ is the expected immediate reward vector under policy $\\pi$, $P_\\pi$ is the state transition matrix under policy $\\pi$, and $\\gamma$ is the discount factor. Where:`,
    `$\\gamma = ${env.value.reward.gamma}$`,
    `$(r_\\pi)^T =$ [${displayVector(rewardTensor.value, 0)}]`,
    `$P_\\pi = $ ${displaySparseBoolMatrix(transitionTensor.value)}`,
  ].join('\n\n')
})
</script>

<template>
  <div class="flex justify-center">
    <div class="rounded-lg border p-4 bg-white/5 w-180">
      <div class="flex items-center gap-2 mb-4">
        <span class="text-muted-foreground">Examples:</span>
        <Button
          variant="link"
          v-for="example of getPolicyExamples(env.rows, env.cols)"
          :key="example.name"
          @click="env.policy = cloneDeep(example.policy)"
        >
          {{ example.name }}
        </Button>
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
                    :title="`r:${r} c:${c} -> ${env.policy?.[r]?.[c] ?? 'stay'}`"
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

      <Separator class="my-4" />

      <Tabs v-model="activeTab" class="w-full">
        <TabsList>
          <TabsTrigger value="original-data"> Original Data </TabsTrigger>
          <TabsTrigger value="closed-form"> Closed-form Solution </TabsTrigger>
          <TabsTrigger value="iterative"> Iterative Solution </TabsTrigger>
        </TabsList>
        <TabsContent value="original-data">
          <MarkedView :markdown="commonMarkdown" />
        </TabsContent>
        <TabsContent value="closed-form"> TODO: Closed-form Solution </TabsContent>
        <TabsContent value="iterative"> TODO: Iterative Solution </TabsContent>
      </Tabs>
    </div>
  </div>
</template>
