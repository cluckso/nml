// Simple in-memory rate limiter.
// In serverless (e.g. Vercel), the store resets on cold start, so limits are per-instance.
// For production at scale, use Redis or Vercel KV so limits are shared across instances.

interface RateLimitStore {
  [key: string]: {
    count: number
    resetAt: number
  }
}

const store: RateLimitStore = {}

export function rateLimit(
  identifier: string,
  maxRequests: number,
  windowMs: number
): { allowed: boolean; remaining: number; resetAt: number } {
  const now = Date.now()
  const key = identifier

  if (!store[key] || now > store[key].resetAt) {
    store[key] = {
      count: 1,
      resetAt: now + windowMs,
    }
    return {
      allowed: true,
      remaining: maxRequests - 1,
      resetAt: store[key].resetAt,
    }
  }

  if (store[key].count >= maxRequests) {
    return {
      allowed: false,
      remaining: 0,
      resetAt: store[key].resetAt,
    }
  }

  store[key].count++
  return {
    allowed: true,
    remaining: maxRequests - store[key].count,
    resetAt: store[key].resetAt,
  }
}

// Clean up old entries periodically
if (typeof setInterval !== "undefined") {
  setInterval(() => {
    const now = Date.now()
    Object.keys(store).forEach((key) => {
      if (now > store[key].resetAt) {
        delete store[key]
      }
    })
  }, 60000) // Clean up every minute
}
