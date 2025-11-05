<script setup lang="ts">
import { Empty, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle } from '@/components/ui/empty'
import { Bot } from 'lucide-vue-next'
</script>
<template>
  <Empty>
    <EmptyHeader>
      <EmptyMedia variant="icon">
        <Bot />
      </EmptyMedia>
    </EmptyHeader>
    <EmptyTitle>SSPKU RL Lab</EmptyTitle>
    <EmptyDescription> Welcome to the SSPKU Reinforcement Learning Lab! </EmptyDescription>
  </Empty>
</template>
