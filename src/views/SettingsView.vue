<script setup lang="ts">
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { useColorMode } from '@vueuse/core'
const { store: mode } = useColorMode()
</script>
<template>
  <div class="flex justify-center">
    <Card class="w-full max-w-xl bg-foreground/5">
      <CardHeader>
        <CardTitle>Preferences</CardTitle>
      </CardHeader>
      <CardContent>
        <p class="flex items-center gap-4 my-2">
          <span>Theme</span>
          <Select v-model="mode">
            <SelectTrigger>
              <SelectValue placeholder="Theme" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="light">Light</SelectItem>
              <SelectItem value="dark">Dark</SelectItem>
              <SelectItem value="auto">System</SelectItem>
            </SelectContent>
          </Select>
        </p>
      </CardContent>
    </Card>
  </div>
</template>
