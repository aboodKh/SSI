import type { User } from '~/server/db/schema'

export const useUser = () => useState<User | undefined>('user', () => undefined)

// export const usePageTitle = () => useState('pageTitle', () => undefined)
