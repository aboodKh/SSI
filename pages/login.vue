<script lang="ts" setup>
import { onMounted } from 'vue'

import { useUser } from '~/composables/states'

useHead({
  title: 'Login',
})

const appConfig = useAppConfig()
const runtimeConfig = useRuntimeConfig()
const user = useUser()
const toast = useToast()
const intervalId = ref()
const state = reactive({
  // should change it to AuthorizationUrl
  url: '',
  isLoading: true,
  sessionId: '',
  // executionId: '',
})

const getVReq = async () => {
  const response = await fetch(`api/verification/vRequest`, {
    method: 'POST',
    // headers: {
    //   'Content-Type': 'application/json', // Set Content-Type to JSON
    // },
    body: JSON.stringify({
      presentationTemplateId: runtimeConfig.public.PARADYM_PRESENTATION_TEMPLATE_ID,
    }),
  })
  return response.json()
}

const getVerificationSession = async () => {
  const response = await fetch(`api/verification/${state.sessionId}`)
  return response.json()
}
const fetchStatus = async () => {
  // const res = await $fetch(`/api/status/${state.executionId}`)

  // We create a presentation request and render the QR-code in the client.
  // Workflow will automatically continue after the QR is scanned and the request is answered.
  // if (res.status === 'waitingForTrigger') {
  //   state.isLoading = false
  //   state.url = res.actions.createPresentationRequestInvitation.output.invitation.invitationUrl
  // }

  if (state.url) {
    state.isLoading = false
  }
  const vId = await getVerificationSession()
  // Fetch user based on the presented email address from the credential
  if (vId.status === 'verified') {
    const email = vId.credentials[0].presentedAttributes.email
    console.log(`vId: ${JSON.stringify(vId)}`)
    console.log(`vId.presentedAttributes.email: ${vId.credentials[0].presentedAttributes.email}`)
    const userResponse = await $fetch(`/api/users/${email}`)

    if (!userResponse || !userResponse.user) {
      toast.add({ title: 'User could not be found. Please create a new account.' })
      await navigateTo('/sign-up')
      clearInterval(intervalId.value)
      return
    }

    user.value = userResponse.user
    localStorage.setItem('user', JSON.stringify(userResponse.user))
    await navigateTo('/')
  }
}

// Start the login workflow as soon as the component mounts.
onMounted(async () => {
  // const loginRes = await $fetch(`/api/start/${runtimeConfig.public.LOGIN_WORKFLOW_ID}`, {
  //   method: 'POST',
  // })

  // state.executionId = loginRes.id

  const vReq = await getVReq()
  console.log(vReq)
  console.log(`vReq.credentials: ${vReq.credentials}`)
  const authzUrl = vReq.authorizationRequestUri
  state.url = authzUrl
  state.sessionId = vReq.id
  // To keep this demo simple, we use polling to periodically check on the status of the execution
  // This can be improved by using Webhooks (https://docs.paradym.id/working-with-executions/using-webhooks)
  intervalId.value = setInterval(async () => {
    if (state.url && !user.value) await fetchStatus()
  }, 2000)
})

onUnmounted(async () => {
  clearInterval(intervalId.value)
})

// Clear the interval if user exists
watch(
  () => user.value,
  () => clearInterval(intervalId.value)
)
</script>

<template>
  <UContainer>
    <UCard class="p-8 max-w-md mx-auto">
      <div>
        <img class="mx-auto h-20 w-auto" src="~/assets/eric.svg" alt="Your Company" />
        <h2 class="mt-6 text-center text-2xl font-bold leading-9 tracking-tight text-white">
          Log in to your {{ appConfig.RP.name }} account
        </h2>

        <div class="flex flex-col items-center justify-between sm:mx-auto sm:w-full sm:max-w-sm h-80">
          <div />
          <transition name="fade" mode="out-in" class="my-8">
            <UProgress v-if="state.isLoading" animation="carousel" />
            <QrCode v-else :value="state.url" />
          </transition>
          <div>
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
            <p class="mt-4 text-center text-sm text-gray-500">
              Don't have {{ appConfig.issuer.name }} credential card ?
              {{ ' ' }}
              <ULink
                active-class="text-primary"
                inactive-class="font-semibold text-primary hover:text-primary-600"
                to="/sign-up"
              >
                Sign up
              </ULink>
            </p>
          </div>
        </div>
      </div>
    </UCard>
  </UContainer>
</template>
