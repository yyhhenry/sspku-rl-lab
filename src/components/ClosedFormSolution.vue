<script setup lang="ts">
import MarkedView from '@/components/MarkedView.vue'
import { getRewardTensor, getTransitionTensor, gridCellColor, type GridEnv } from '@/lib/grid-env'
import {
  applyMatrixToVector,
  checkMatrix,
  displayMatrix,
  identityMatrix,
  InvertMatrix,
  matrixAdd,
} from '@/lib/tensor'
import { computed } from 'vue'
import { toast } from 'vue-sonner'

const props = defineProps<{
  env: GridEnv
}>()

const env = computed(() => props.env)

const rewardTensor = computed(() => getRewardTensor(env.value))

const transitionTensor = computed(() => getTransitionTensor(env.value))

const inverseTensor = computed(() => {
  // Compute (I - γ P)^(-1)
  const gamma = env.value.reward.gamma
  const [n, cols] = checkMatrix(transitionTensor.value)
  if (n !== cols) {
    throw new Error('Transition tensor must be square')
  }
  const I = identityMatrix(n)
  const I_minus_gamma_P = matrixAdd(I, transitionTensor.value, {
    alpha: 1,
    beta: -gamma,
  })
  try {
    return InvertMatrix(I_minus_gamma_P)
  } catch {
    toast.error(
      'Failed to compute inverse matrix. The policy may lead to a singular transition matrix.',
    )
    return I
  }
})

const valueTensor = computed(() => {
  return applyMatrixToVector(inverseTensor.value, rewardTensor.value)
})

const md = computed(() => {
  return [
    `$v_\\pi = $`,
    `${displayMatrix([valueTensor.value], 4, ' ')}`,
    `$(I - \\gamma P_\\pi)^{-1} = $`,
    `\`\`\`txt\n${displayMatrix(inverseTensor.value, 2, ' ')}\n\`\`\``,
  ].join('\n\n')
})
</script>
<template>
  <div>
    <MarkedView :markdown="'$v_\\pi = (I - \\gamma P_\\pi)^{-1} r_\\pi$'" />
    <div class="flex justify-center">
      <div>
        <div class="text-sm font-bold mb-2">State Value</div>
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
                    {{ (valueTensor[r * env.cols + c] ?? 0).toFixed(1) }}
                  </span>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
    <MarkedView :markdown="md" />
  </div>
</template>
