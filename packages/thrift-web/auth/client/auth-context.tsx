'use client'

import React, { createContext, useContext, useEffect, useState } from 'react'
import { User } from '@supabase/supabase-js'
import { useSetAtom } from 'jotai'
import { authEffectAtom } from '@/atoms/auth-effect'

export const AuthProvider = () => {
  const initializeAuth = useSetAtom(authEffectAtom)
  const [, setLoading] = useState(true)

  useEffect(() => {
    initializeAuth({})
    setLoading(true)
  }, [initializeAuth])

  return null
}
