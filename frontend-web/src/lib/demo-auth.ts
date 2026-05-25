export const DEMO_ACCOUNT = {
  userId: 'demo-user',
  username: 'demo',
  password: 'demo123',
  displayName: 'Demo User',
} as const

export function validateDemoLogin(username: string, password: string): boolean {
  return (
    username.trim().toLowerCase() === DEMO_ACCOUNT.username &&
    password === DEMO_ACCOUNT.password
  )
}
