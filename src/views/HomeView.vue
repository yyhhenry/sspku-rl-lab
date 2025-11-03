<script setup lang="ts">
import { Empty, EmptyHeader, EmptyMedia, EmptyTitle } from '@/components/ui/empty'
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
  </Empty>
</template>
