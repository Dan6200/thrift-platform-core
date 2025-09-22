import { ProfileResponseSchema } from "#src/app-schema/profiles.js";
import { ProfileData } from "#src/types/profile/index.js";
import { ProfileResponseData } from "#src/profiles/types.js";

export const isValidProfileResponseData = (
  data: unknown,
): data is ProfileResponseData => {
  const { error } = ProfileResponseSchema.validate(data);
  error && console.error(error);
  return !error;
};
