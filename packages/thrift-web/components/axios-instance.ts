import axios from 'axios'

export const axiosInstance = axios.create({
  baseURL: process.env.NEXT_PUBLIC_SERVER + '/v1',
})

// Attach the Supabase access token to every request so the API can authenticate
// the user (the API validates the Supabase JWT in the `Authorization` header).
axiosInstance.interceptors.request.use(async (config) => {
  if (typeof window !== 'undefined' && !config.headers.Authorization) {
    const { supabase } = await import('@/auth/client/config')
    const {
      data: { session },
      error,
    } = await supabase.auth.getSession()
    if (error) throw error
    if (session?.access_token)
      config.headers.Authorization = `Bearer ${session.access_token}`
  }
  return config
})
