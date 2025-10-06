import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/app/api/auth/[...nextauth]/route'

export async function getAuthSession() {
  return await getServerSession(authOptions)
}

export function requireAuth(handler: Function) {
  return async (req: any, res: any) => {
    const session = await getAuthSession()
    
    if (!session) {
      return new Response('Unauthorized', { status: 401 })
    }
    
    return handler(req, res, session)
  }
}