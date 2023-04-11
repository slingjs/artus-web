<template>
  <template v-if='isSessionValid'>
    <article>
      <section class='caption'>Hello, <span>{{ session!.name }}</span>!</section>
      <section><a :href='signOutHref' target='_self'>Sign out.</a></section>
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
import * as urls from '../apis/urls'
import shared from '@sling/artus-web-shared'

const router = useRouter()
const userStore = useUserStore()
const session = toRef(userStore, 'session')
const isSessionValid = computed(() => userStore.judgeSessionSignedIn(session.value))
const signOutHref = computed(() => {
  return shared.utils.updateQueryStringParam(
    urls.account.signOut,
    shared.constants.accountSignOutCallbackSearchParamKey,
    '/sign-in'
  )
})

if (!isSessionValid.value) {
  userStore.fetchSession().finally(() => {
    if (!isSessionValid.value) {
      router.replace({ name: 'accountLandingSignIn' })
    }
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
