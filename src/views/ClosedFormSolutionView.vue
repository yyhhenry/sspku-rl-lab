<script setup lang="ts">
import { Empty, EmptyHeader, EmptyMedia, EmptyTitle } from '@/components/ui/empty'
import { Calculator } from 'lucide-vue-next'
</script>

<template>
  <Empty>
    <EmptyHeader>
      <EmptyMedia variant="icon">
        <Calculator />
      </EmptyMedia>
    </EmptyHeader>
    <EmptyTitle>Closed-form Solution</EmptyTitle>
  </Empty>
</template>
