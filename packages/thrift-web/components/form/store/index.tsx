'use client'
import { Button } from '@/components/ui/button'
import { SubmitHandler, useForm } from 'react-hook-form'
import { Form } from '../../ui/form'
import { StoreFormType } from './types'
import { submitHandler } from './submit-handler'
import useFormProps from './use-form-props'
import Image from 'next/image'
import { storeAtom } from '@/atoms/index'
import { useSetAtom } from 'jotai'

import {
  StoreName,
  CustomDomain,
  AddressLine1,
  AddressLine2,
  City,
  State,
  ZipPostalCode,
  Country,
} from './form-fields'
import { Card, CardContent } from '@/components/ui/card'

export function StoreForm() {
  const setStore = useSetAtom(storeAtom)
  const form = useForm<StoreFormType>(useFormProps)
  const { handleSubmit } = form
  const submit: SubmitHandler<StoreFormType> = submitHandler.bind(
    null,
    setStore,
  )

  return (
    <div className="flex flex-col gap-6 w-5/6 sm:w-2/3">
      <Card className="overflow-hidden p-0 glass-effect">
        <CardContent className="grid p-0 md:grid-cols-2">
          <div className="p-6 md:p-8">
            <Form {...form}>
              <form
                className="flex flex-col w-full space-y-2 md:space-y-4"
                onSubmit={handleSubmit(submit)}
              >
                <StoreName form={form} />
                <CustomDomain form={form} />
                <AddressLine1 form={form} />
                <AddressLine2 form={form} />
                <City form={form} />
                <State form={form} />
                <ZipPostalCode form={form} />
                <Country form={form} />
                <Button className="w-fit mx-auto mt-4 mb-8" type="submit">
                  Create Store
                </Button>
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
    </div>
  )
}
