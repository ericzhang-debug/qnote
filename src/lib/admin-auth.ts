import { NextResponse } from 'next/server'
import { verifyToken } from './auth'

export function getAdminUser(request: Request) {
  const token = request.headers.get('authorization')?.replace('Bearer ', '') 
    || request.headers.get('cookie')?.split('token=')[1]?.split(';')[0]

  if (!token) {
    return null
  }

  const payload = verifyToken(token)
  
  if (!payload || !payload.isAdmin) {
    return null
  }

  return payload
}

export function requireAdmin(request: Request) {
  const user = getAdminUser(request)
  
  if (!user) {
    return {
      error: NextResponse.json({ error: '未授权访问' }, { status: 401 }),
      user: null,
    }
  }

  return { error: null, user }
}
