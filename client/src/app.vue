<script setup lang='ts'>
import { RouterView } from 'vue-router'
import {
  NConfigProvider,
  darkTheme,
  NLayoutHeader,
  NLayoutContent,
  NLayout,
  NMessageProvider,
  NLayoutFooter
} from 'naive-ui'
import { useUserStore } from '@/stores/user'

const userStore = useUserStore()

window.addEventListener('beforeunload', function() {
  userStore.beforeUnload()
})
// import shared from '@sling/artus-web-shared'
//
// const random = shared.utils.calcRandomString()
</script>

<template>
  <n-config-provider :theme='darkTheme'>
    <n-message-provider>
      <n-layout class='layout'>
        <div class='layout-wrapper'>
          <n-layout-header>
            <header>
              <n-h1>Header</n-h1>
            </header>
          </n-layout-header>
          <n-layout-content :nativeScrollbar='false'>
            <main>
              <RouterView />
            </main>
          </n-layout-content>
          <n-layout-footer>
            <footer>Footer</footer>
          </n-layout-footer>
        </div>
      </n-layout>
    </n-message-provider>
  </n-config-provider>
</template>

<style lang='scss' scoped>
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

<style lang='scss'>
:root {
  font-size: 10px;
}

body {
  font-size: 1.6rem;
}
</style>
