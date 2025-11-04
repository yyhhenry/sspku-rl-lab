<script setup lang="ts">
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
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
import cloneDeep from 'lodash/cloneDeep'
import { PanelTopClose } from 'lucide-vue-next'
import { ref, watchEffect } from 'vue'
import { toast } from 'vue-sonner'
import z from 'zod'

const env = ref<GridEnv>(gridEnvStorage.value)
const debouncedEnv = refDebounced(env, 200)

const activeTab = ref('')
watchEffect(() => {
  const parsed = GridEnvSchema.safeParse(debouncedEnv.value)
  if (!parsed.success) {
    toast.error(z.prettifyError(parsed.error))
    return
  }
  gridEnvStorage.value = parsed.data
  activeTab.value = ''
})

const actions = gridActionEnum as unknown as GridAction[]

function cycleAction(r: number, c: number) {
  const cur = env.value.policy?.[r]?.[c] ?? 'stay'
  const idx = actions.indexOf(cur)
  const next = actions[(idx + 1) % actions.length]
  if (!env.value.policy || !env.value.policy[r]) return
  env.value.policy[r]![c] = next as GridAction
}
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
        <div class="flex items-center gap-4">
          <TabsList>
            <TabsTrigger value="closed-form"> Closed-form Solution </TabsTrigger>
            <TabsTrigger value="iterative"> Iterative Solution </TabsTrigger>
          </TabsList>
          <Button variant="secondary" @click="activeTab = ''" v-if="activeTab !== ''">
            <PanelTopClose />
          </Button>
        </div>
        <TabsContent value="closed-form"> TODO: Closed-form Solution </TabsContent>
        <TabsContent value="iterative"> TODO: Iterative Solution </TabsContent>
      </Tabs>
    </div>
  </div>
</template>
