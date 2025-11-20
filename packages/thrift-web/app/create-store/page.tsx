'use client'

import { useAtomValue } from 'jotai'
import { userAtom } from '@/atoms'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'

import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import Image from 'next/image'
import { StoreForm } from '@/components/form/store'
import { createVendorAccount } from '@/lib/actions/profile' // Import the server action

export default function CreateStore() {
  const userAccount = useAtomValue(userAtom)
  const router = useRouter()

  useEffect(() => {
    // If user is not logged in, redirect to sign-in
    if (userAccount === null) {
      router.push('/sign-in')
    }
  }, [userAccount, router])

  if (userAccount === null) {
    return null // Don't render anything while redirecting
  }

  // If user is logged in and is a vendor, show the store form
  if (userAccount.is_vendor) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen py-2">
        <h1 className="text-2xl font-semibold mb-6">Create New Store</h1>
        <StoreForm />
      </div>
    )
  }

  // If user is logged in but NOT a vendor, show the "become a vendor" prompt
  return (
    <div className="container flex overflow-hidden h-[80vh] mx-auto p-4 mt-20">
      <Card className="w-full h-fit rounded-lg space-y-4 sm:w-4/5 p-8 mx-auto shadow-lg shadow-primary">
        <CardHeader className="w-full mx-auto text-2xl font-bold text-center">
          Start Selling On Thrift!
        </CardHeader>
        <CardContent className="space-x-8 flex items-start">
          <Image
            className="rounded-md"
            src="/pexels-shop.jpg"
            alt="shop image"
            width={500}
            height={500}
          />
          <p>
            &quot;Create a store to list your products, reach more customers,
            and track your sales with ease. Our platform gives you a powerful
            dashboard to manage orders and view performance insights—all in one
            place. Ready to expand your reach? Join today and start
            selling!&quot;
          </p>
        </CardContent>
        <CardFooter className="flex justify-end w-full">
          <Button className="" onClick={() => createVendorAccount()}>
            Become A Vendor & Create Store
          </Button>
          <Button onClick={() => router.back()}>Go Back</Button>
        </CardFooter>
      </Card>
      <section className="absolute top-0 right-10 mt-[30%] flex flex-col items-center h-fit overflow-y-hidden">
        <div className="bg-primary rounded-full w-[50px] h-[50px] flex justify-center items-center">
          1
        </div>
        <div className="border-primary border h-96 w-0"></div>
      </section>
    </div>
  )
}
