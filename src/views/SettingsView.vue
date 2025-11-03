<script setup lang="ts">
import { Empty, EmptyHeader, EmptyMedia, EmptyTitle } from '@/components/ui/empty'
import { Sliders } from 'lucide-vue-next'
</script>
<template>
  <Empty>
    <EmptyHeader>
      <EmptyMedia variant="icon">
        <Sliders />
      </EmptyMedia>
    </EmptyHeader>
    <EmptyTitle>Settings</EmptyTitle>
  </Empty>
</template>
