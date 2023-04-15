<template>
  <n-card class='sign-in'>
    <n-h1>Sign in</n-h1>
    <n-form :model='formConfig.model' :rules='formConfig.rules' ref='formRef'>
      <n-form-item label='Email' path='email' first>
        <n-input v-model:value='formConfig.model.email' placeholder='' type='email' name='email' />
      </n-form-item>
      <n-form-item label='Password' path='password' first>
        <n-input v-model:value='formConfig.model.password' placeholder='' type='password' name='password' />
      </n-form-item>
      <n-form-item :show-feedback='false'>
        <n-button type='primary' attr-type='button' @click.prevent='handleSubmit'>Submit</n-button>
      </n-form-item>
    </n-form>

    <n-form-item :show-feedback='false'>
      <n-space justify='space-between' style='width: 100%'>
        <n-a @click='router.push({ name: "accountLandingSignUp" })'>Sign up.</n-a>
        <n-a @click='router.push({ name: "accountLandingChangePwd" })'>Change Pwd.</n-a>
      </n-space>
    </n-form-item>
  </n-card>
</template>

<script lang='ts' setup>
import { NCard, NForm, NFormItem, NInput, NButton, NH1, NA, NSpace, FormInst, useMessage } from 'naive-ui'
import { reactive, ref } from 'vue'
import { useUserStore } from '@/stores/user'
import { useRouter } from 'vue-router'
import _ from 'lodash'
import { preEncryptPassword } from '@/utils/string'
import { validatePassword } from '@/utils/form'
import { getUserSessionSignOutCausedByMessage } from '@/utils/user'
import { sessionCache } from '@/utils/cache'
import { USER_SIGN_IN_PRESET_EMAIL_KEY } from '@/constants'

/* Data START */
const userStore = useUserStore()
const router = useRouter()

const formConfig = reactive({
  model: {
    email: '',
    password: ''
  },
  rules: {
    email: [
      {
        required: true,
        trigger: ['input', 'blur']
      },
      {
        type: 'email',
        trigger: ['input', 'blur']
      }
    ],
    password: [
      {
        required: true,
        trigger: ['input', 'blur']
      },
      {
        validator: validatePassword,
        trigger: ['input', 'blur']
      }
    ]
  }
})

const formRef = ref(null)
const message = useMessage()
/* Data END */

/* Prop START */
/* Prop END */

/* Methods START */
function handleSubmit () {
  (formRef.value as FormInst).validate(errors => {
    if (errors) {
      return
    }

    userStore.fetchSignIn(
      _.merge({}, formConfig.model, { password: preEncryptPassword(formConfig.model.password) })
    )
      .then(res => {
        message.success('Success!')
        setTimeout(() => router.replace({ name: 'home' }), 500)
      })
      .catch((e: Response) => {
        e.json().then(res => {
          message.error(res.code || 'Failed')
        })
      })
  })
}

/* Methods END */

/* LifeCycle START */
const presetEmail = sessionCache.getSessionCache(USER_SIGN_IN_PRESET_EMAIL_KEY, { autoRemove: true })
if (typeof presetEmail === 'string' && presetEmail) {
  formConfig.model.email = presetEmail
}

// If sign out with some reason.
const signOutCausedBy = getUserSessionSignOutCausedByMessage({ autoRemove: true })
if (signOutCausedBy) {
  message.warning(signOutCausedBy, { closable: true, duration: 0 })
}

/* LifeCycle END */
</script>

<script lang='ts'>
import { defineComponent } from 'vue'

defineComponent({
  name: 'SignIn'
})
</script>

<style lang='scss'>

</style>
