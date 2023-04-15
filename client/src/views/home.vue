<template>
  <template v-if='isSessionValid'>
    <article>
      <section class='caption'>Hello, <span>{{ session!.name }}</span>!</section>
      <section><a href='javascript:;' target='_self' @click='handleSignOut'>Sign out.</a></section>
    </article>
  </template>
  <template v-else>
    <span>Loading...</span>
  </template>
</template>

<script lang='ts' setup>
import { useUserStore } from '@/stores/user'
import { computed, toRef } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()
const userStore = useUserStore()
const session = toRef(userStore, 'session')
const isSessionValid = computed(() => userStore.judgeSessionSignedIn(session.value))
const handleSignOut = () => userStore.fetchSignOut()

if (isSessionValid.value) {
  userStore.wsCommunicateAccountObserve()
} else {
  userStore.fetchSession().finally(() => {
    if (!isSessionValid.value) {
      router.replace({ name: 'accountLandingSignIn' })
      return
    }

    userStore.wsCommunicateAccountObserve()
  })
}
</script>

<style lang='scss' scoped>
.caption {
  &:first-letter {
    font-size: 3em;
  }
}
</style>
