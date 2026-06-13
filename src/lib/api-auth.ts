import { prisma } from './prisma'
import bcrypt from 'bcryptjs'

export interface ApiAuthResult {
  authenticated: boolean
  userId?: number
  error?: string
}

export async function verifyApiKey(
  appKey: string,
  appSecret: string
): Promise<ApiAuthResult> {
  if (!appKey || !appSecret) {
    return { authenticated: false, error: '缺少 AppKey 或 AppSecret' }
  }

  const apiKey = await prisma.apiKey.findUnique({
    where: { appKey },
    include: { user: true },
  })

  if (!apiKey) {
    return { authenticated: false, error: 'AppKey 无效' }
  }

  if (!apiKey.isActive) {
    return { authenticated: false, error: 'AppKey 已被禁用' }
  }

  const isValid = await bcrypt.compare(appSecret, apiKey.appSecret)

  if (!isValid) {
    return { authenticated: false, error: 'AppSecret 错误' }
  }

  return { authenticated: true, userId: apiKey.userId }
}
