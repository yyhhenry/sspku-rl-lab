<script setup lang="ts">
import { Empty, EmptyHeader, EmptyMedia, EmptyTitle } from '@/components/ui/empty'
import { Hand } from 'lucide-vue-next'
</script>

<template>
  <Empty>
    <EmptyHeader>
      <EmptyMedia variant="icon">
        <Hand />
      </EmptyMedia>
    </EmptyHeader>
    <EmptyTitle>Manual Policy</EmptyTitle>
  </Empty>
</template>
