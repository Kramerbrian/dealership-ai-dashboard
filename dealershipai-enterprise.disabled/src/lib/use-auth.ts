"use client"

import { useSession, signIn, signOut } from "next-auth/react"
import { useRouter } from "next/navigation"

export function useAuth() {
  const { data: session, status } = useSession()
  const router = useRouter()

  const isLoading = status === "loading"
  const isAuthenticated = !!session?.user

  const login = async (provider?: string) => {
    try {
      await signIn(provider, { 
        callbackUrl: "/dashboard/demo",
        redirect: false 
      })
    } catch (error) {
      console.error("Login error:", error)
    }
  }

  const logout = async () => {
    try {
      await signOut({ 
        callbackUrl: "/",
        redirect: false 
      })
      router.push("/")
    } catch (error) {
      console.error("Logout error:", error)
    }
  }

  const hasPermission = (permission: string) => {
    return session?.user?.permissions?.includes(permission) || false
  }

  const hasRole = (role: string) => {
    return session?.user?.role === role
  }

  const getAccessToken = () => {
    return session?.accessToken
  }

  return {
    user: session?.user,
    session,
    isLoading,
    isAuthenticated,
    login,
    logout,
    hasPermission,
    hasRole,
    getAccessToken,
  }
}
