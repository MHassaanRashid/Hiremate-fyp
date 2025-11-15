// frontend/lib/auth.ts
"use client"

import { supabase } from "./supabaseClient"

// ---- Login with Email ----
export async function loginWithEmail(email: string, password: string) {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  })

  if (error) throw error

  // Log the JWT token for testing in Postman
  console.log("JWT Access Token:", data.session?.access_token)

  return data
}

// ---- Get Current Session ----
export async function getCurrentSession() {
  const { data, error } = await supabase.auth.getSession()
  if (error) throw error
  return data.session
}

// ---- Get Access Token directly ----
export async function getAccessToken() {
  const { data, error } = await supabase.auth.getSession()
  if (error) throw error
  return data.session?.access_token || null
}
