<script setup lang="ts">
import MarkedView from '@/components/MarkedView.vue'
import { getRewardTensor, getTransitionTensor, type GridEnv } from '@/lib/grid-env'
import { displayMatrix } from '@/lib/tensor'
import { computed } from 'vue'

const props = defineProps<{
  env: GridEnv
}>()

const env = computed(() => props.env)

const rewardTensor = computed(() => getRewardTensor(env.value))

const transitionTensor = computed(() => getTransitionTensor(env.value))

const md = computed(() => {
  return [
    `$v_\\pi = r_\\pi + \\gamma P_\\pi v_\\pi$`,
    `Here, $v_\\pi$ is the value function under policy $\\pi$, $r_\\pi$ is the expected immediate reward vector under policy $\\pi$, $P_\\pi$ is the state transition matrix under policy $\\pi$, and $\\gamma$ is the discount factor. Where:`,
    `$\\gamma = ${env.value.reward.gamma}$`,
    `$(r_\\pi)^T =$`,
    `${displayMatrix([rewardTensor.value])}`,
    `$P_\\pi = $`,
    `<pre>${displayMatrix(transitionTensor.value, 0, ' ')}</pre>`,
  ].join('\n\n')
})
</script>
<template>
  <div class="w-full overflow-x-auto">
    <MarkedView :markdown="md" />
  </div>
</template>
