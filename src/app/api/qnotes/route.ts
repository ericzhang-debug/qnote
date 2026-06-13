import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { v4 as uuidv4 } from 'uuid'
import { verifyApiKey } from '@/lib/api-auth'

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const page = parseInt(searchParams.get('page') || '1')
  const pageSize = parseInt(searchParams.get('pageSize') || '20')
  const skip = (page - 1) * pageSize

  const [qnotes, total] = await Promise.all([
    prisma.qnote.findMany({
      where: { isPublic: true },
      orderBy: { createdAt: 'desc' },
      skip,
      take: pageSize,
      include: {
        user: {
          select: {
            id: true,
            displayName: true,
            username: true,
          },
        },
      },
    }),
    prisma.qnote.count({
      where: { isPublic: true },
    }),
  ])

  return NextResponse.json({
    qnotes,
    pagination: {
      page,
      pageSize,
      total,
      totalPages: Math.ceil(total / pageSize),
    },
  })
}

export async function POST(request: Request) {
  const appKey = request.headers.get('x-app-key')
  const appSecret = request.headers.get('x-app-secret')

  if (!appKey || !appSecret) {
    return NextResponse.json(
      { error: '请提供 X-APP-KEY 和 X-APP-SECRET 请求头' },
      { status: 401 }
    )
  }

  const auth = await verifyApiKey(appKey, appSecret)

  if (!auth.authenticated) {
    return NextResponse.json({ error: auth.error }, { status: 401 })
  }

  try {
    const { content } = await request.json()

    if (!content || !content.trim()) {
      return NextResponse.json({ error: '内容不能为空' }, { status: 400 })
    }

    const qnote = await prisma.qnote.create({
      data: {
        content: content.trim(),
        userId: auth.userId!,
        shareId: uuidv4(),
        isPublic: true,
      },
      include: {
        user: {
          select: { displayName: true, username: true },
        },
      },
    })

    return NextResponse.json({ qnote }, { status: 201 })
  } catch {
    return NextResponse.json({ error: '发布微语失败' }, { status: 500 })
  }
}
