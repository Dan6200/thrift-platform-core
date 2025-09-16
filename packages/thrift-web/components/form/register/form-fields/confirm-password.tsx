import { Input } from '@/components/ui/input'
import { ComponentProps } from 'react'

type InputProps = ComponentProps<typeof Input>
import { UseFormReturn } from 'react-hook-form'
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '../../../ui/form'
import { RegisterFormState } from '../types'

export const ConfirmPassword = ({
  form,
}: {
  form: UseFormReturn<RegisterFormState>
}) => (
  <FormField
      control={form.control as any}
    name="confirm_password"
    render={({ field }) => (
      <FormItem>
        <FormLabel>Confirm Password</FormLabel>
        <FormControl>
          <Input
              onChange={field.onChange}
              onBlur={field.onBlur}
              name={field.name}
              value={field.value}
              placeholder="Confirm Password"
            />
        </FormControl>
        <FormMessage />
      </FormItem>
    )}
  />
)
