import { z } from 'zod'

export const ProfileSchema = z.object({
  first_name: z.string(),
  last_name: z.string(),
  email: z.string().email().nullable(),
  phone: z.string().nullable(),
  dob: z.coerce.date(), // Use z.coerce.date() to handle various date formats (e.g., strings) and convert to Date object
  country: z.string(),
  is_customer: z.boolean(),
  is_vendor: z.boolean(),
})

export type Profile = z.infer<typeof ProfileSchema>
