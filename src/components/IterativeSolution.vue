<script setup lang="ts">
import MarkedView from '@/components/MarkedView.vue'
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationNext,
  PaginationPrevious,
} from '@/components/ui/pagination'
import { getRewardTensor, getTransitionTensor, gridCellColor, type GridEnv } from '@/lib/grid-env'
import { applyMatrixToVector } from '@/lib/tensor'
import { cloneDeep } from 'es-toolkit'
import { computed, ref, watch } from 'vue'
import { Separator } from './ui/separator'
import { useSidebar } from './ui/sidebar'

const props = defineProps<{
  env: GridEnv
}>()

const env = computed(() => props.env)

const rewardTensor = computed(() => getRewardTensor(env.value))

const transitionTensor = computed(() => getTransitionTensor(env.value))

const activeIteration = ref(0)
const iterationTensors = computed(() => {
  const iters: { value: number[]; maxDiff: number }[] = [
    { value: cloneDeep(rewardTensor.value), maxDiff: Infinity },
  ]
  while (iters.length < 100 && iters[iters.length - 1]!.maxDiff > 0.001) {
    const prev = iters[iters.length - 1]!.value
    const next = applyMatrixToVector(transitionTensor.value, prev).map(
      (val, idx) => (rewardTensor.value[idx] ?? 0) + env.value.reward.gamma * val,
    )
    const maxDiff = next.reduce((maxErr, val, idx) => {
      const err = Math.abs(val - (prev[idx] ?? 0))
      return err > maxErr ? err : maxErr
    }, 0)
    iters.push({ value: next, maxDiff })
  }
  return iters
})
watch(
  iterationTensors,
  (iters) => {
    activeIteration.value = iters.length - 1
  },
  { immediate: true },
)

const valueTensor = computed(() => {
  const iters = iterationTensors.value
  const last = iters[iters.length - 1]
  return iters[activeIteration.value] ?? last
})

const pageCount = computed(() => iterationTensors.value.length)
const page = computed({
  get: () => activeIteration.value + 1,
  set: (val: number) => {
    activeIteration.value = val - 1
  },
})

const { isMobile } = useSidebar()
</script>
<template>
  <div>
    <MarkedView :markdown="'$v_{k+1} = r_\\pi + \\gamma P_\\pi v_k$'" />
    <div v-if="valueTensor" class="my-2 flex items-center gap-4 justify-center">
      <span class="font-bold">Iteration {{ page }}</span>
      <Separator orientation="vertical" />
      <span>Max diff: {{ valueTensor.maxDiff.toFixed(4) }}</span>
    </div>
    <div v-if="valueTensor" class="my-4 flex justify-center">
      <div>
        <table class="border-collapse">
          <tbody>
            <tr v-for="(row, r) in env.cells" :key="r">
              <td v-for="(cell, c) in row" :key="c" class="p-0">
                <div
                  :title="`r:${r} c:${c} -> ${env.policy?.[r]?.[c] ?? 'stay'}`"
                  :class="[
                    'w-10 h-10 flex items-center justify-center border cursor-pointer select-none hover:border-2 hover:border-blue-400 border transition-all duration-150',
                    gridCellColor[cell],
                  ]"
                >
                  <span class="text-sm">
                    {{ (valueTensor?.value[r * env.cols + c] ?? 0).toFixed(1) }}
                  </span>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
    <Pagination v-model:page="page" :items-per-page="1" :total="pageCount" :show-edges="!isMobile">
      <PaginationContent v-slot="{ items }">
        <PaginationPrevious />

        <template v-for="(item, index) in items" :key="index">
          <PaginationItem
            v-if="item.type === 'page'"
            :value="item.value"
            :is-active="item.value === page"
          >
            {{ item.value }}
          </PaginationItem>
          <PaginationEllipsis v-if="item.type === 'ellipsis'" />
        </template>

        <PaginationNext />
      </PaginationContent>
    </Pagination>
  </div>
</template>
