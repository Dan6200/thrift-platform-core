// server/src/lib/paystack.ts
import Paystack from '@paystack/paystack-sdk'

const secretKey = process.env.PAYSTACK_SECRET_KEY

if (!secretKey) {
  throw new Error(
    'PAYSTACK_SECRET_KEY is missing from environment variables. Please check your .env file.',
  )
}

/**
 * Singleton instance of the Paystack SDK client.
 */
export const paystack = new Paystack(secretKey)

/**
 * Helper to verify Paystack Webhook Signatures using HMAC SHA512.
 */
import crypto from 'node:crypto'

export const verifyPaystackSignature = (
  rawBody: string | Buffer,
  signature: string,
): boolean => {
  const hash = crypto
    .createHmac('sha512', secretKey)
    .update(rawBody)
    .digest('hex')

  return hash === signature
}
