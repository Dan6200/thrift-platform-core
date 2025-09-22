import { ProfileResponseSchema } from '#src/app-schema/profiles.js'
import { ProfileResponseData } from '../../profiles/types.js'

export const isValidProfileResponseData = (
  data: unknown,
): data is ProfileResponseData => {
  const { error } = ProfileResponseSchema.validate(data)
  error && console.error(error)
  return !error
}
