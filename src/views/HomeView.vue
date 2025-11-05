<script setup lang="ts">
import { Button } from '@/components/ui/button'
import { Empty, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle } from '@/components/ui/empty'
import { Bot } from 'lucide-vue-next'

const openGitHub = () => {
  window.open('https://github.com/yyhhenry/sspku-rl-lab', '_blank')
}
</script>
<template>
  <Empty>
    <EmptyHeader>
      <EmptyMedia variant="icon">
        <Bot />
      </EmptyMedia>
    </EmptyHeader>
    <EmptyTitle>SSPKU RL Lab</EmptyTitle>
    <EmptyDescription>
      <p>北大软微强化学习算法在线Lab</p>
      <p>
        <Button variant="link" @click="openGitHub"> yyhhenry/sspku-rl-lab </Button>
      </p>
      <p>特别鸣谢：郁老师</p>
    </EmptyDescription>
  </Empty>
</template>
