const runtimeConfig = useRuntimeConfig()

type VerificationSession = {
  status: string
}

export default defineEventHandler(async (payload): Promise<VerificationSession> => {
  try {
    // const workflowId = event.context.params?.id as string
    // console.log(payload)
    const body = await readBody(payload)
    console.log(JSON.parse(body))
    const parsed = JSON.parse(body)
    const res = await fetch(`${runtimeConfig.public.PARADYM_URL}/openid4vc/verification/request`, {
      method: 'POST',
      headers: {
        'x-access-token': runtimeConfig.PARADYM_API_KEY,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(parsed),
    })

    const response = await res.json()

    return response
  } catch (e) {
    throw createError({
      statusCode: 400,
      statusMessage: e instanceof Error ? e.message : 'An unknown error occurred.',
    })
  }
})
