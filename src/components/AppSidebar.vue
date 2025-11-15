<script setup lang="ts">
import type { SidebarProps } from '@/components/ui/sidebar'
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from '@/components/ui/sidebar'
import { Grid2x2Check, Settings, Workflow } from 'lucide-vue-next'
import { ref } from 'vue'
import SidebarGroupContent from './ui/sidebar/SidebarGroupContent.vue'

const props = withDefaults(defineProps<SidebarProps>(), {
  collapsible: 'offcanvas',
})

const navMain = ref([
  {
    title: 'Environment',
    icon: Grid2x2Check,
    url: '/edit-grid',
  },
  {
    title: 'Manual Policy',
    icon: Workflow,
    url: '/edit-policy',
  },
])
</script>

<template>
  <Sidebar v-bind="props">
    <SidebarHeader>
      <SidebarMenu>
        <SidebarMenuItem>
          <SidebarMenuButton asChild>
            <RouterLink to="/" class="py-5">
              <span class="text-lg">
                <Grid2x2Check />
              </span>
              <span class="text-base font-bold">SSPKU RL Lab</span>
            </RouterLink>
          </SidebarMenuButton>
        </SidebarMenuItem>
      </SidebarMenu>
    </SidebarHeader>
    <SidebarContent>
      <SidebarGroup>
        <SidebarGroupContent class="flex flex-col gap-2">
          <SidebarMenu>
            <SidebarMenuItem v-for="navSection in navMain" :key="navSection.title">
              <SidebarMenuButton asChild>
                <RouterLink :to="navSection.url">
                  <component :is="navSection.icon" v-if="navSection.icon" />
                  <span>{{ navSection.title }}</span>
                </RouterLink>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarGroupContent>
      </SidebarGroup>
    </SidebarContent>
    <SidebarFooter>
      <SidebarMenu>
        <SidebarMenuItem>
          <SidebarMenuButton asChild>
            <RouterLink to="/settings">
              <Settings />
              Settings
            </RouterLink>
          </SidebarMenuButton>
        </SidebarMenuItem>
      </SidebarMenu>
    </SidebarFooter>
  </Sidebar>
</template>
