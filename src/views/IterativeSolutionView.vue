<script setup lang="ts">
import { Empty, EmptyHeader, EmptyMedia, EmptyTitle } from '@/components/ui/empty'
import { Repeat } from 'lucide-vue-next'
</script>

<template>
  <Empty>
    <EmptyHeader>
      <EmptyMedia variant="icon">
        <Repeat />
      </EmptyMedia>
    </EmptyHeader>
    <EmptyTitle>Iterative Solution</EmptyTitle>
  </Empty>
</template>
