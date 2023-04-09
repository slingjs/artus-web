<template>
  <template v-if='isSessionValid'>
    <n-h1>Hello,</n-h1>
    <span>{{ session!.name }}</span>
  </template>
  <template v-else>
    <span>Loading...</span>
  </template>
</template>

<script lang='ts' setup>
import { useUserStore } from '@/stores/user'
import { computed, toRef } from 'vue'
import { useRouter } from 'vue-router'
import { NH1 } from 'naive-ui'

const router = useRouter()
const userStore = useUserStore()
const session = toRef(userStore, 'session')
const isSessionValid = computed(() => userStore.judgeSessionSignedIn(session.value))

if (!isSessionValid.value) {
  userStore.fetchSession().finally(() => {
    if (!isSessionValid.value) {
      router.replace({ name: 'accountLandingSignIn' })
    }
  })
}
</script>

<style lang='scss'>

</style>
