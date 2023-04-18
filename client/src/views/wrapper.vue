<template>
  <n-layout class="layout">
    <div class="layout-wrapper">
      <n-layout-header>
        <header>
          <n-h1>Header</n-h1>
        </header>
      </n-layout-header>
      <n-layout-content :nativeScrollbar="false">
        <main>
          <RouterView />
        </main>
      </n-layout-content>
      <n-layout-footer>
        <footer>Footer</footer>
      </n-layout-footer>
    </div>
  </n-layout>
</template>

<script lang="ts" setup>
import { onMounted } from 'vue'
import { NLayout, NLayoutContent, NLayoutFooter, NLayoutHeader, useMessage } from 'naive-ui'
import { useUserStore } from '@/stores/user'
import { RouterView } from 'vue-router'

const userStore = useUserStore()

onMounted(() => {
  userStore.setMessageHandler(useMessage())
})
</script>

<style lang="scss" scoped>
.layout {
  height: 100vh;
  overflow: auto;
  border-radius: 0;

  &-wrapper {
    margin: auto;
    display: grid;
    grid-template-rows: 5rem 1fr 5rem;
    height: 100%;
  }
}

.n-layout-content {
  max-width: 65rem;
  margin: auto;
  width: 100%;
}

.n-layout-header,
.n-layout-footer {
  display: grid;
  align-items: center;
  justify-items: center;
}
</style>
