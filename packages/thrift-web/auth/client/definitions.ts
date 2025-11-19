'use client'
import { supabase } from '../client/config'

export async function createUserWithEmailAndPasswordWrapper(
  email: string,
  password: string,
) {
  return supabase.auth
    .signUp({
      email,
      password,
    })
    .then(({ data, error }) => {
      if (error) {
        throw new Error('Failed to Create User. -- Tag:3\n\t' + error.message)
      }
      return data.user
    })
    .catch((e) => {
      throw new Error('Failed to Create User. -- Tag:3\n\t' + e.message)
    })
}

export async function signInWithEmailAndPasswordWrapper(
  email: string,
  password: string,
) {
  return supabase.auth
    .signInWithPassword({
      email,
      password,
    })
    .then(({ data, error }) => {
      if (error) {
        return {
          result: error.message,
          message: 'Failed to Sign In User.',
          success: false,
        }
      }
      return {
        result: data.user,
        message: 'User Signed In Successfully',
        success: true,
      }
    })
    .catch((error: Error) => {
      console.error(error)
      return {
        result: error.toString(),
        message: 'Failed to Sign In User.',
        success: false,
      }
    })
}

export async function signOutWrapper() {
  return supabase.auth.signOut().catch(function (error) {
    throw new Error('Error signing out -- Tag:27\n\t' + error.message)
  })
}
