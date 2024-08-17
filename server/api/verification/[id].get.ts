const runtimeConfig = useRuntimeConfig()

type Credentialoffer = {
  status: string
}

export default defineEventHandler(async (event): Promise<Credentialoffer> => {
  try {
    const vId = event.context.params?.id as string

    const res = await fetch(`${runtimeConfig.public.PARADYM_URL}/openid4vc/verification/${vId}`, {
      method: 'GET',
      headers: {
        'x-access-token': runtimeConfig.PARADYM_API_KEY,
        'Content-Type': 'application/json',
      },
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
