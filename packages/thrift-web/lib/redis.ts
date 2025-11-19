// This file configures a Redis client for a standard Node.js environment.
// It uses ioredis, which is suitable for connecting to Google Cloud Memorystore.
// Ensure you have the following environment variables set:
// REDIS_HOST
// REDIS_PORT
// REDIS_PASSWORD (if applicable)

import { Redis } from '@upstash/redis'

if (
  !process.env.UPSTASH_REDIS_REST_URL ||
  !process.env.UPSTASH_REDIS_REST_TOKEN
) {
  throw new Error('Upstash Redis environment variables are not set.')
}

const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL,
  token: process.env.UPSTASH_REDIS_REST_TOKEN,
})

export default redis
