'use client'
import { useEffect } from 'react'
import { useSetAtom } from 'jotai'
import { authEffectAtom } from '@/atoms/auth-effect'
export const AuthInitializer = () => {
  const initializeAuth = useSetAtom(authEffectAtom)
  useEffect(() => initializeAuth([]), [initializeAuth])
  return null
}
