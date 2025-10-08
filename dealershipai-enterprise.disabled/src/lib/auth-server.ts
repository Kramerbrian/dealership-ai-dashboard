import { getServerSession } from "next-auth/next"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"
import { redirect } from "next/navigation"

export async function getSession() {
  return await getServerSession(authOptions)
}

export async function requireAuth() {
  const session = await getSession()
  
  if (!session) {
    redirect("/auth/signin")
  }
  
  return session
}

export async function requireRole(requiredRole: string) {
  const session = await requireAuth()
  
  if (session.user.role !== requiredRole) {
    redirect("/unauthorized")
  }
  
  return session
}

export async function requirePermission(permission: string) {
  const session = await requireAuth()
  
  if (!session.user.permissions?.includes(permission)) {
    redirect("/unauthorized")
  }
  
  return session
}
