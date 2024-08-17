<script setup lang="ts">
import { usePageTitle, useUser } from '~/composables/states'

import type { FormError } from '#ui/types'

useHead({
  title: 'Sign up',
})

const appConfig = useAppConfig()
const runtimeConfig = useRuntimeConfig()

const user = useUser()
const toast = useToast()
const intervalId = ref()
const state = reactive({
  name: undefined,
  email: undefined,
  isLoading: false,
  status: 'form',
  executionId: '',
  invitationUrl: '',
  // from connecitonId to offerId
  offerId: '',
})

const validate = (state: any): FormError[] => {
  const errors = []
  if (!state.name) errors.push({ path: 'name', message: 'This field is required.' })
  if (!state.email) errors.push({ path: 'email', message: 'This field is required.' })
  return errors
}

async function onSubmit() {
  state.isLoading = true

  // User email is used as FK, so first check if user email already exists.
  const userExists = await $fetch(`/api/users/${state.email}`)

  if (userExists.user) {
    console.dir(`exist? ${userExists.user.email}`)
    toast.add({ title: 'Email already exists. Please use a different email.' })
    state.isLoading = false
    return
  }

  // new user? Then initiate the offer
  const offer = await getOffer()
  console.log(offer)
  state.invitationUrl = offer.offerUri
  state.offerId = offer.id
}

const offerStatus = async () => {
  // We  render the QR-code in the client.
  console.log(`invitationUrl:  ${state.invitationUrl}`)
  if (state.invitationUrl) {
    state.isLoading = false
    state.status = 'connect'
  }

  // Credential has been issued (2nd action) and we can now render a message to the user
  // prompting them to accept the credential notification in their wallet.
  // if (res.status === 'waitingForTrigger' && Object.keys(res.actions).length === 2) {
  //   state.status = 'credentialIssued'
  // }

  const cred = await getOfferedCred()
  // Credential has been successfully issued and sign up process is completed.
  console.log(`status is: ${cred}`)
  if (cred.status === 'completed') {
    state.status = 'completed'
    await onCompleted()
  }
}

async function onCompleted() {
  // Save the new user in the data storage, including the connectionId for future interactions.
  const usr = await $fetch('/api/users', {
    method: 'POST',
    body: {
      email: state.email,
      name: state.name,
      connectionId: state.offerId,
    },
  })

  // Add user to state and redirect to dashboard
  user.value = usr.newUser
  await navigateTo('/')
}

// To keep this demo simple, we use polling to periodically check on the status of the execution
// This can be improved by using Webhooks (https://docs.paradym.id/working-with-executions/using-webhooks)
onMounted(async () => {
  intervalId.value = setInterval(async () => {
    if (state.invitationUrl && !user.value) await offerStatus()
  }, 2000)
  // const offer = await getOffer()
  // console.log(offer)
})

onUnmounted(async () => {
  clearInterval(intervalId.value)
})

// Clear the interval if user exists
watch(
  () => user.value,
  () => clearInterval(intervalId.value)
)
// extra code
const getOffer = async () => {
  const response = await fetch(`api/start/offer`, {
    method: 'POST',
    body: JSON.stringify({
      credentials: [
        {
          credentialTemplateId: runtimeConfig.public.PARADYM_TEMPLATE_ID,
          attributes: {
            name: state.name,
            email: state.email,
            student_number: 12345678,
          },
        },
      ],
    }),
  })
  return response.json()
}

const getOfferedCred = async () => {
  const res = await fetch(`/api/offerStatus/${state.offerId}`)
  const offeredCred = res.json()
  return offeredCred
}

// const route = useRoute()
// const t = usePageTitle()
// //@ts-ignore
// t.value = route.meta.title
</script>

<template>
  <UContainer>
    <UCard class="p-8 max-w-md mx-auto overflow-hidden">
      <div>
        <img class="mx-auto h-20 w-auto" src="~/assets/Hippo_JPG-uvalogo_tag_p.jpg" alt="Your Company" />
        <h2 class="mt-6 text-center text-2xl font-bold leading-9 tracking-tight text-white">
          Sign up for a {{ appConfig.issuer.name }} digital credential
        </h2>
      </div>

      <transition class="mt-10 h-64" name="fade" mode="out-in">
        <div v-if="state.status === 'form'" key="form">
          <UForm :validate="validate" :state="state" class="space-y-4" @submit="onSubmit">
            <UFormGroup label="Name" name="name">
              <UInput v-model="state.name" />
            </UFormGroup>
            <UFormGroup label="Email" name="email">
              <UInput v-model="state.email" type="email" />
            </UFormGroup>
            <UButton :loading="state.isLoading" type="submit" class="flex w-full justify-center"> Sign up </UButton>
          </UForm>
          <p class="mt-10 text-center text-sm text-gray-500">
            Already have an account?
            {{ ' ' }}
            <ULink
              active-class="text-primary"
              inactive-class="font-semibold text-primary hover:text-primary-600"
              to="/login"
            >
              Log in
            </ULink>
          </p>
        </div>
        <div
          v-else-if="state.status === 'connect'"
          key="connect"
          class="flex gap-8 flex-col justify-center items-center"
        >
          <QrCode :value="state.invitationUrl" />
          <p>
            Use the
            <ULink
              active-class="text-primary"
              inactive-class="font-semibold text-primary hover:text-primary-600"
              to="https://docs.paradym.id/integrating-with-a-holder-wallet/paradym-wallet"
              target="_blank"
            >
              Paradym wallet
            </ULink>
            to scan the QR code.
          </p>
        </div>
        <div v-else key="credentialIssued" class="grid text-center items-center justify-center h-64 w-full mx-auto">
          <p>Accept the credential in your wallet to complete the sign up process.</p>
        </div>
      </transition>
    </UCard>
  </UContainer>
</template>
