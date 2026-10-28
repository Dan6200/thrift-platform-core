'use client'
import { useState } from 'react'
import { ThemeProvider } from '@/components/theme-provider'
import { AuthInitializer } from '@/auth/client/auth-context'
import { Provider } from 'jotai'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'

export default function Providers({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(() => new QueryClient())

  return (
    <Provider>
      <QueryClientProvider client={queryClient}>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <AuthInitializer />
          {children}
        </ThemeProvider>
      </QueryClientProvider>
    </Provider>
  )
}
