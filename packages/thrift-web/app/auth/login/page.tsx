import { LoginForm } from '@/components/auth/login-form'

export default function LoginPage() {
  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="p-8 w-full max-w-sm md:max-w-5xl rounded-xl shadow-lg">
        <LoginForm />
      </div>
    </div>
  )
}
