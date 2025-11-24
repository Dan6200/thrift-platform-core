'use client'
import { ThemeProvider } from '@/components/theme-provider'
import { AuthInitializer } from '@/auth/client/auth-context'
import { Provider } from 'jotai'

export default function Providers({ children }: { children: React.ReactNode }) {
  return (
    <Provider>
      <ThemeProvider
        attribute="class"
        defaultTheme="system"
        enableSystem
        disableTransitionOnChange
      >
        <AuthInitializer />
        {children}
      </ThemeProvider>
    </Provider>
  )
}
