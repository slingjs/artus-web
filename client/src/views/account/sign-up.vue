<template>
  <n-card class="sign-up">
    <n-h1>Sign up</n-h1>
    <n-form :model="formConfig.model" :rules="formConfig.rules" ref="formRef">
      <n-form-item label="Name" path="name" first>
        <n-input v-model:value="formConfig.model.name" placeholder="" name="name" />
      </n-form-item>
      <n-form-item label="Email" path="email" first>
        <n-input v-model:value="formConfig.model.email" placeholder="" type="email" name="email" />
      </n-form-item>
      <n-form-item label="Password" path="password" first>
        <n-input v-model:value="formConfig.model.password" placeholder="" type="password" name="password" />
      </n-form-item>
      <n-form-item label="Confirm Password" path="confirmPassword" first>
        <n-input
          v-model:value="formConfig.model.confirmPassword"
          placeholder=""
          type="password"
          name="confirmPassword"
        />
      </n-form-item>
      <n-form-item :show-feedback="false">
        <n-button type="primary" attr-type="button" @click.prevent="handleSubmit">Submit</n-button>
      </n-form-item>
    </n-form>
    <n-form-item :show-feedback="false">
      <n-space justify="space-between" style="width: 100%">
        <n-a @click="router.push({ name: 'accountLandingSignIn' })">Sign In.</n-a>
        <n-a @click="router.push({ name: 'accountLandingChangePwd' })">Change Pwd.</n-a>
      </n-space>
    </n-form-item>
  </n-card>
</template>

<script lang="ts" setup>
import { NCard, NForm, NFormItem, NInput, NButton, NH1, FormInst, useMessage, NA, NSpace } from 'naive-ui'
import { reactive, ref } from 'vue'
import { useUserStore } from '@/stores/user'
import { useRouter } from 'vue-router'
import { preEncryptPassword } from '@/utils/string'
import _ from 'lodash'
import { validateConfirmPasswordGenerator, validateName, validatePassword } from '@/utils/form'
import { USER_SIGN_IN_PRESET_EMAIL_KEY } from '@/constants'

/* Data START */
const userStore = useUserStore()
const router = useRouter()

const formConfig = reactive({
  model: {
    name: '',
    email: '',
    password: '',
    confirmPassword: ''
  },
  rules: {
    name: [
      {
        required: true,
        trigger: ['input', 'blur']
      },
      {
        validator: validateName,
        trigger: ['input', 'blur']
      }
    ],
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
    confirmPassword: [
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
function handleSubmit() {
  ;(formRef.value as FormInst).validate(errors => {
    if (errors) {
      return
    }

    userStore
      .fetchSignUp(
        _.merge({}, _.omit(formConfig.model, 'confirmPassword'), {
          password: preEncryptPassword(formConfig.model.password)
        }) as any
      )
      .then(res => {
        message.success('Success!')
        sessionStorage.setItem(USER_SIGN_IN_PRESET_EMAIL_KEY, formConfig.model.email)
        setTimeout(() => router.replace({ name: 'home' }), 500)
      })
      .catch((e: Response) => {
        e.json().then(res => {
          message.error(res.code || 'Failed')
        })
      })
  })
}

function validateConfirmPassword(...args: any[]) {
  return validateConfirmPasswordGenerator(formConfig.model)(...args)
}

/* Methods END */

/* LifeCycle START */
/* LifeCycle END */
</script>
<script lang="ts">
import { defineComponent } from 'vue'

defineComponent({
  name: 'SignUp'
})
</script>
<style lang="scss"></style>
