import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireAdmin } from '@/lib/admin-auth'
import { v4 as uuidv4 } from 'uuid'
import { hashPassword } from '@/lib/auth'

export async function GET(request: Request) {
  const { error } = requireAdmin(request)
  if (error) return error

  const apiKeys = await prisma.apiKey.findMany({
    include: {
      user: {
        select: {
          id: true,
          displayName: true,
          username: true,
        },
      },
    },
    orderBy: { createdAt: 'desc' },
  })

  // Mask appSecret for security
  const safeKeys = apiKeys.map((key) => ({
    ...key,
    appSecret: key.appSecret.slice(0, 8) + '...',
  }))

  return NextResponse.json({ apiKeys: safeKeys })
}

export async function POST(request: Request) {
  const { error } = requireAdmin(request)
  if (error) return error

  try {
    const { name, userId } = await request.json()

    if (!name || !userId) {
      return NextResponse.json({ error: '名称和用户不能为空' }, { status: 400 })
    }

    const appKey = 'qk_' + uuidv4().replace(/-/g, '')
    const rawSecret = 'qs_' + uuidv4().replace(/-/g, '') + uuidv4().replace(/-/g, '').slice(0, 16)
    const appSecret = await hashPassword(rawSecret)

    const apiKey = await prisma.apiKey.create({
      data: {
        name,
        appKey,
        appSecret,
        userId: parseInt(userId),
      },
      include: {
        user: {
          select: { displayName: true, username: true },
        },
      },
    })

    // Return the raw secret only once
    return NextResponse.json({
      apiKey: {
        ...apiKey,
        appSecret: rawSecret,
        appSecretHashed: appSecret,
      },
      message: '请妥善保管 AppSecret，之后不再显示',
    }, { status: 201 })
  } catch {
    return NextResponse.json({ error: '创建 API 密钥失败' }, { status: 500 })
  }
}
