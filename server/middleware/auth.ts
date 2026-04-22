export default defineEventHandler((event) => {
  const email = getRequestHeader(event, 'x-email') || ''
  const user = getRequestHeader(event, 'x-user') || ''

  if (!email && import.meta.dev) {
    event.context.auth = { email: 'dev@freedom.co.jp', user: 'dev' }
    return
  }

  event.context.auth = { email, user }
})
