import { NextResponse } from 'next/server'

export function GET() {
  const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME
  const apiKey = process.env.NEXT_PUBLIC_CLOUDINARY_API_KEY
  const apiSecret = process.env.CLOUDINARY_API_SECRET // API Secret should not be public

  return NextResponse.json({
    NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME: cloudName || 'NOT SET',
    NEXT_PUBLIC_CLOUDINARY_API_KEY: apiKey
      ? `SET (ends with ...${apiKey.slice(-4)})`
      : 'NOT SET',
    CLOUDINARY_API_SECRET: apiSecret
      ? `SET (ends with ...${apiSecret.slice(-4)})`
      : 'NOT SET', // Still check for server-side usage
  })
}
