'use client'

import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { toast } from '@/components/ui/use-toast'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Field, FieldSeparator, FieldSet } from '../ui/field'
import Image from 'next/image'
import { login } from '@/auth/server/definitions'
import { useTransition } from 'react'
import GoogleLoginButton from '../ui/google-login-button'
import AppleLoginButton from '../ui/apple-login-button'
import MetaLoginButton from '../ui/meta-login-button'

const SignInFormSchema = z.object({
  email: z.string().email({ message: 'Please enter a valid email address.' }),
  password: z.string().min(1, { message: 'Password is required.' }),
})

export function LoginForm({
  className,
  ...props
}: React.ComponentProps<'div'>) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const form = useForm<z.infer<typeof SignInFormSchema>>({
    resolver: zodResolver(SignInFormSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  })

  async function onSubmit(data: z.infer<typeof SignInFormSchema>) {
    startTransition(async () => {
      const formData = new FormData()
      Object.entries(data).forEach(([key, value]) => {
        formData.append(key, String(value))
      })

      const result = await login(formData)
      if (result.error) {
        toast({
          title: 'Failed to Login',
          description: result.error || 'An unexpected error occurred.',
          variant: 'destructive',
        })
      } else {
        toast({ title: 'Login Successful', variant: 'default' })
        router.refresh() // refresh
        const referrer = document.referrer
        if (isSameOrigin(referrer)) {
          router.back()
        } else {
          router.push('/') // Navigate to the homepage
        }
      }
    })
  }

  return (
    <div className={cn('flex flex-col gap-6', className)} {...props}>
      <Card className="overflow-hidden p-0 glass-effect">
        <CardContent className="grid p-0 md:grid-cols-2">
          <div className="p-6 md:p-8">
            <Form {...form}>
              <form
                onSubmit={form.handleSubmit(onSubmit)}
                className="flex flex-col gap-6"
              >
                <FieldSet disabled={isPending} className="flex flex-col gap-4">
                  <div className="flex flex-col items-center gap-2 text-center">
                    <h1 className="text-2xl font-bold">Welcome back</h1>
                    <p className="text-muted-foreground text-balance">
                      Login to your Thrift account
                    </p>
                  </div>
                  <FormField
                    control={form.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Email</FormLabel>
                        <FormControl>
                          <Input
                            type="email"
                            placeholder="m@example.com"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="password"
                    render={({ field }) => (
                      <FormItem>
                        <div className="flex items-center">
                          <FormLabel>Password</FormLabel>
                          <Link
                            href="#"
                            className="ml-auto text-sm underline-offset-2 hover:underline"
                          >
                            Forgot your password?
                          </Link>
                        </div>
                        <FormControl>
                          <Input type="password" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <Button type="submit" className="w-full">
                    Login
                  </Button>
                </FieldSet>
                <FieldSeparator className="*:data-[slot=field-separator-content]:bg-card">
                  Or continue with
                </FieldSeparator>
                <Field className="grid grid-cols-3 gap-4">
                  <AppleLoginButton />
                  <GoogleLoginButton />
                  <MetaLoginButton />
                </Field>
                <div className="mt-4 text-center text-sm">
                  Don&apos;t have an account?{' '}
                  <Link href="/auth/register" className="underline">
                    Sign up
                  </Link>
                </div>
              </form>
            </Form>
          </div>
          <div className="bg-muted relative hidden md:block">
            <Image
              src="/pexels-shop.jpg"
              alt="A vibrant and bustling marketplace"
              className="absolute inset-0 h-full w-full object-cover dark:brightness-[0.3] dark:grayscale"
              fill
            />
          </div>
        </CardContent>
      </Card>
      <div className="px-6 text-center text-sm text-muted-foreground">
        By clicking continue, you agree to our{' '}
        <Link href="#" className="underline">
          Terms of Service
        </Link>{' '}
        and{' '}
        <Link href="#" className="underline">
          Privacy Policy
        </Link>
        .
      </div>
    </div>
  )
}
