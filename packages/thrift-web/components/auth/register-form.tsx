'use client'

import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { toast } from '@/components/ui/use-toast'
import { useRouter } from 'next/navigation'
import axios from 'axios'
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
import { Checkbox } from '@/components/ui/checkbox'
import Image from 'next/image'

const RegisterFormSchema = z
  .object({
    first_name: z.string().min(1, 'First name is required'),
    last_name: z.string().min(1, 'Last name is required'),
    email: z.string().email({ message: 'Please enter a valid email address.' }),
    password: z
      .string()
      .min(8, { message: 'Password must be at least 8 characters.' }),
    confirm_password: z.string(),
    dob: z.string().refine((val) => !isNaN(Date.parse(val)), {
      message: 'A valid date of birth is required',
    }),
    country: z.string().min(1, 'Country is required'), // Added country field
    is_vendor: z.boolean(),
  })
  .refine((data) => data.password === data.confirm_password, {
    message: "Passwords don't match",
    path: ['confirm_password'],
  })

export function RegisterForm({
  className,
  ...props
}: React.ComponentProps<'div'>) {
  const router = useRouter()
  const form = useForm<z.infer<typeof RegisterFormSchema>>({
    resolver: zodResolver(RegisterFormSchema),
    defaultValues: {
      first_name: '',
      last_name: '',
      email: '',
      password: '',
      confirm_password: '',
      dob: '',
      is_vendor: false,
    },
  })

  async function onSubmit(data: z.infer<typeof RegisterFormSchema>) {
    try {
      const { confirm_password, ...postData } = data
      const response = await axios.post(
        process.env.NEXT_PUBLIC_SERVER + '/v1/auth/register',
        postData,
      )
      if (response.status === 201) {
        toast({
          title: 'Registration Successful',
          description: 'Please check your email to verify your account.',
        })
        router.push('/auth/login')
      }
    } catch (error: any) {
      toast({
        title: 'Registration Failed',
        description:
          error.response?.data?.message || 'An unexpected error occurred.',
        variant: 'destructive',
      })
    }
  }

  return (
    <div className={cn('flex flex-col gap-6', className)} {...props}>
      <Card className="overflow-hidden p-0 glass-effect">
        <CardContent className="grid p-0 md:grid-cols-2">
          <div className="p-6 md:p-8">
            <Form {...form}>
              <form
                onSubmit={form.handleSubmit(onSubmit)}
                className="flex flex-col gap-4"
              >
                <div className="flex flex-col items-center gap-2 text-center">
                  <h1 className="text-2xl font-bold">Create your account</h1>
                  <p className="text-muted-foreground text-sm text-balance">
                    Enter your details below to create your account
                  </p>
                </div>

                <div className="flex gap-4">
                  <FormField
                    control={form.control}
                    name="first_name"
                    render={({ field }) => (
                      <FormItem className="w-1/2">
                        <FormLabel>First Name</FormLabel>
                        <FormControl>
                          <Input {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="last_name"
                    render={({ field }) => (
                      <FormItem className="w-1/2">
                        <FormLabel>Last Name</FormLabel>
                        <FormControl>
                          <Input {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email</FormLabel>
                      <FormControl>
                        <Input type="email" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="flex gap-4">
                  <FormField
                    control={form.control}
                    name="password"
                    render={({ field }) => (
                      <FormItem className="w-1/2">
                        <FormLabel>Password</FormLabel>
                        <FormControl>
                          <Input type="password" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="confirm_password"
                    render={({ field }) => (
                      <FormItem className="w-1/2">
                        <FormLabel>Confirm Password</FormLabel>
                        <FormControl>
                          <Input type="password" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={form.control}
                  name="dob"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Date of Birth</FormLabel>
                      <FormControl>
                        <Input type="date" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="country"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Country</FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="is_vendor"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-center space-x-2 space-y-0">
                      <FormControl>
                        <Checkbox
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                      <FormLabel className="font-normal">
                        I want to be a vendor
                      </FormLabel>
                    </FormItem>
                  )}
                />

                <Button type="submit" className="w-full">
                  Create Account
                </Button>

                <div className="mt-4 text-center text-sm">
                  Already have an account?{' '}
                  <Link href="/auth/login" className="underline">
                    Sign In
                  </Link>
                </div>
              </form>
            </Form>
          </div>
          <div className="bg-muted relative hidden md:block">
            <Image
              src="/pexels-kowalievska-1040173.jpg"
              alt="A person happily shopping for clothes"
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
