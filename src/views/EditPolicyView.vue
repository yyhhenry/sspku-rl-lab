<script setup lang="ts">
import ClosedFormSolution from '@/components/ClosedFormSolution.vue'
import IterativeSolution from '@/components/IterativeSolution.vue'
import PolicyCommonData from '@/components/PolicyCommonData.vue'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import { useSidebar } from '@/components/ui/sidebar'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  getPolicyExamples,
  gridActionEnum,
  gridActionIcon,
  gridCellColor,
  GridEnvSchema,
  gridEnvStorage,
  type GridAction,
  type GridEnv,
} from '@/lib/grid-env'
import { refDebounced } from '@vueuse/core'
import { cloneDeep } from 'es-toolkit'
import { ref, watchEffect } from 'vue'
import { toast } from 'vue-sonner'
import z from 'zod'

const env = ref<GridEnv>(gridEnvStorage.value)
const debouncedEnv = refDebounced(env, 200)

watchEffect(() => {
  const parsed = GridEnvSchema.safeParse(debouncedEnv.value)
  if (!parsed.success) {
    toast.error(z.prettifyError(parsed.error))
    return
  }
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
const { isMobile } = useSidebar()
</script>

<template>
  <div class="flex justify-center">
    <div class="rounded-lg border p-4 bg-white/5 w-180 max-w-full">
      <div class="flex items-center gap-2 mb-4 flex-wrap">
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

      <Tabs default-value="common-data" class="w-full overflow-x-auto">
        <TabsList>
          <TabsTrigger value="common-data"> Common Data </TabsTrigger>
          <TabsTrigger value="closed-form"> Closed-form Solution </TabsTrigger>
          <TabsTrigger value="iterative"> Iterative Solution </TabsTrigger>
        </TabsList>
        <TabsContent value="common-data">
          <PolicyCommonData :env="gridEnvStorage" />
        </TabsContent>
        <TabsContent value="closed-form">
          <ClosedFormSolution :env="gridEnvStorage" />
        </TabsContent>
        <TabsContent value="iterative">
          <IterativeSolution :env="gridEnvStorage" />
        </TabsContent>
      </Tabs>
    </div>
  </div>
</template>
