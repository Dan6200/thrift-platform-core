'use client'

import { useEffect, useState } from 'react'
import { useSetAtom } from 'jotai'
import { authEffectAtom } from '@/atoms/auth-effect'

export const AuthInitializer = () => {
  const initializeAuth = useSetAtom(authEffectAtom)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    initializeAuth({})
    setLoading(false)
  }, [initializeAuth])

  return loading
}
