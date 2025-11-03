<script setup lang="ts">
import { Empty, EmptyHeader, EmptyMedia, EmptyTitle } from '@/components/ui/empty'
import { Shuffle } from 'lucide-vue-next'
</script>

<template>
  <Empty>
    <EmptyHeader>
      <EmptyMedia variant="icon">
        <Shuffle />
      </EmptyMedia>
    </EmptyHeader>
    <EmptyTitle>Random Policy</EmptyTitle>
  </Empty>
</template>
