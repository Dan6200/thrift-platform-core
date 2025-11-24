import { Request, Response, NextFunction } from 'express'
import { supabase } from '#supabase-config'
import BadRequestError from '#src/errors/bad-request.js'
import { StatusCodes } from 'http-status-codes'

export const registerLogic = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const {
    email,
    password,
    first_name,
    last_name,
    phone,
    dob,
    country,
    is_vendor,
  } = req.body

  const { data, error } = await supabase.auth.admin.createUser({
    email,
    password,
    email_confirm: true, // Automatically confirm the email for server-side creation
    user_metadata: {
      first_name,
      last_name,
      phone,
      dob,
      country, // Ensure country is passed to user_metadata for the trigger
      is_vendor: is_vendor || false,
      is_customer: !is_vendor,
    },
  })

  if (error) {
    throw new BadRequestError(error.message)
  }

  res.status(StatusCodes.CREATED).json(data)
}
