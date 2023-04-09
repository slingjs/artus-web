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
    </n-form>
    <n-form-item>
      <n-space>
        <n-button type='primary' attr-type='button' @click.prevent='handleSubmit'>Submit</n-button>
      </n-space>
    </n-form-item>
  </n-card>
</template>

<script lang='ts' setup>
import { NCard, NForm, NFormItem, NInput, NButton, NSpace, NH1, FormInst, useMessage } from 'naive-ui'
import { onBeforeMount, reactive, ref } from 'vue'
import { useUserStore } from '@/stores/user'
import { useRoute, useRouter } from 'vue-router'
import _ from 'lodash'
import { preEncryptPassword } from '@/utils/string'
import { validatePassword } from '@/utils/form'

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
onBeforeMount(() => {
  const route = useRoute()

  const routeEmail = (route.query).email
  if (typeof routeEmail === 'string' && routeEmail) {
    formConfig.model.email = routeEmail
  }
})

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
