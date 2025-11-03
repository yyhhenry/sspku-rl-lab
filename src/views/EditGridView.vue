<script setup lang="ts">
import { Empty, EmptyHeader, EmptyMedia, EmptyTitle } from '@/components/ui/empty'
import { Grid } from 'lucide-vue-next'
</script>

<template>
  <Empty>
    <EmptyHeader>
      <EmptyMedia variant="icon">
        <Grid />
      </EmptyMedia>
    </EmptyHeader>
    <EmptyTitle>Edit Grid</EmptyTitle>
  </Empty>
</template>
