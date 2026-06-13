import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireAdmin } from '@/lib/admin-auth'
import { v4 as uuidv4 } from 'uuid'

export async function GET(request: Request) {
  const { error } = requireAdmin(request)
  if (error) return error

  const { searchParams } = new URL(request.url)
  const page = parseInt(searchParams.get('page') || '1')
  const pageSize = parseInt(searchParams.get('pageSize') || '20')
  const skip = (page - 1) * pageSize

  const [qnotes, total] = await Promise.all([
    prisma.qnote.findMany({
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
    prisma.qnote.count(),
  ])

  return NextResponse.json({
    qnotes,
    pagination: { page, pageSize, total, totalPages: Math.ceil(total / pageSize) },
  })
}

export async function POST(request: Request) {
  const { error, user } = requireAdmin(request)
  if (error) return error

  try {
    const { content, isPublic } = await request.json()

    if (!content || !content.trim()) {
      return NextResponse.json({ error: '内容不能为空' }, { status: 400 })
    }

    const qnote = await prisma.qnote.create({
      data: {
        content: content.trim(),
        userId: user!.userId,
        shareId: uuidv4(),
        isPublic: isPublic ?? true,
      },
      include: {
        user: {
          select: { displayName: true, username: true },
        },
      },
    })

    return NextResponse.json({ qnote }, { status: 201 })
  } catch {
    return NextResponse.json({ error: '创建微语失败' }, { status: 500 })
  }
}
