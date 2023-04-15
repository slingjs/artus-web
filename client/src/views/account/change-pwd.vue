<template>
  <n-card class='change-pwd'>
    <n-h1>Change password</n-h1>
    <n-form :model='formConfig.model' :rules='formConfig.rules' ref='formRef'>
      <n-form-item label='Email' path='email' first>
        <n-input v-model:value='formConfig.model.email' placeholder='' type='email' name='email' />
      </n-form-item>
      <n-form-item label='Password' path='password' first>
        <n-input v-model:value='formConfig.model.password' placeholder='' type='password' name='password' />
      </n-form-item>
      <n-form-item label='OldPassword' path='oldPassword' first>
        <n-input v-model:value='formConfig.model.oldPassword' placeholder='' type='password' name='oldPassword' />
      </n-form-item>
      <n-form-item :show-feedback='false'>
        <n-button type='primary' attr-type='button' @click.prevent='handleSubmit'>Submit</n-button>
      </n-form-item>
    </n-form>
    <n-form-item :show-feedback='false'>
      <n-space justify='space-between' style='width: 100%'>
        <n-a @click='router.push({ name: "accountLandingSignIn" })'>Sign In.</n-a>
        <n-a @click='router.push({ name: "accountLandingSignUp" })'>Sign Up.</n-a>
      </n-space>
    </n-form-item>
  </n-card>
</template>

<script lang='ts' setup>
import {
  NCard,
  NForm,
  NFormItem,
  NInput,
  NButton,
  NH1,
  FormInst,
  useMessage,
  NA,
  NSpace
} from 'naive-ui'
import { reactive, ref } from 'vue'
import { useUserStore } from '@/stores/user'
import { useRouter } from 'vue-router'
import { preEncryptPassword } from '@/utils/string'
import _ from 'lodash'
import { validateConfirmPasswordGenerator, validatePassword } from '@/utils/form'

/* Data START */
const userStore = useUserStore()
const router = useRouter()

const formConfig = reactive({
  model: {
    email: '',
    password: '',
    oldPassword: ''
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
    ],
    oldPassword: [
      {
        required: true,
        trigger: ['input', 'blur']
      },
      {
        validator: validateConfirmPassword,
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

    userStore.fetchChangePwd(
      _.merge(
        {},
        formConfig.model,
        {
          password: preEncryptPassword(formConfig.model.password),
          oldPassword: preEncryptPassword(formConfig.model.oldPassword)
        }
      )
    )
      .then(res => {
        message.success('Success!')
        setTimeout(
          () => router.replace({ name: 'accountLandingSignIn', query: { email: formConfig.model.email } }),
          500
        )
      })
      .catch((e: Response) => {
        e.json().then(res => {
          message.error(res.code || 'Failed')
        })
      })
  })
}

function validateConfirmPassword (...args: any) {
  return validateConfirmPasswordGenerator(formConfig.model)(...args)
}

/* Methods END */

/* LifeCycle START */
/* LifeCycle END */
</script>

<script lang='ts'>
import { defineComponent } from 'vue'

defineComponent({
  name: 'ChangePwd'
})
</script>

<style lang='scss'>

</style>
