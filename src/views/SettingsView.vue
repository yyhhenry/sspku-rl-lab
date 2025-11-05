<script setup lang="ts">
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { useColorMode } from '@vueuse/core'
import { SunMoon } from 'lucide-vue-next'
const { store: mode } = useColorMode()
</script>
<template>
  <div class="flex justify-center">
    <div class="rounded-lg border p-4 bg-white/5 max-w-full w-180 overflow-x-auto">
      <div class="flex items-center gap-4">
        <span class="text-muted-foreground">Color Mode:</span>
        <DropdownMenu>
          <DropdownMenuTrigger as-child>
            <Button variant="outline">
              <SunMoon />
              <span class="capitalize">{{ mode }}</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent>
            <DropdownMenuItem @click="mode = 'light'"> Light </DropdownMenuItem>
            <DropdownMenuItem @click="mode = 'dark'"> Dark </DropdownMenuItem>
            <DropdownMenuItem @click="mode = 'auto'"> System </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  </div>
</template>
