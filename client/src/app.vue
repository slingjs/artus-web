<script setup lang='ts'>
import { NConfigProvider, darkTheme, NMessageProvider } from 'naive-ui'
import { useUserStore } from '@/stores/user'
import ViewsWrapper from '@/views/wrapper.vue'

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
      <views-wrapper />
    </n-message-provider>
  </n-config-provider>
</template>

<style lang='scss'>
:root {
  font-size: 10px;
}

body {
  font-size: 1.6rem;
}
</style>
