import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireAdmin } from '@/lib/admin-auth'
import { hashPassword } from '@/lib/auth'

export async function GET(request: Request) {
  const { error } = requireAdmin(request)
  if (error) return error

  const users = await prisma.user.findMany({
    select: {
      id: true,
      username: true,
      displayName: true,
      isAdmin: true,
      createdAt: true,
      _count: {
        select: {
          qnotes: true,
          apiKeys: true,
        },
      },
    },
    orderBy: { createdAt: 'desc' },
  })

  return NextResponse.json({ users })
}

export async function POST(request: Request) {
  const { error } = requireAdmin(request)
  if (error) return error

  try {
    const { username, password, displayName, isAdmin } = await request.json()

    if (!username || !password) {
      return NextResponse.json({ error: '用户名和密码不能为空' }, { status: 400 })
    }

    const existing = await prisma.user.findUnique({
      where: { username },
    })

    if (existing) {
      return NextResponse.json({ error: '用户名已存在' }, { status: 409 })
    }

    const hashedPassword = await hashPassword(password)

    const user = await prisma.user.create({
      data: {
        username,
        password: hashedPassword,
        displayName: displayName || username,
        isAdmin: isAdmin ?? false,
      },
      select: {
        id: true,
        username: true,
        displayName: true,
        isAdmin: true,
        createdAt: true,
      },
    })

    return NextResponse.json({ user }, { status: 201 })
  } catch {
    return NextResponse.json({ error: '创建用户失败' }, { status: 500 })
  }
}
