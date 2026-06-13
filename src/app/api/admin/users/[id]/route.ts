import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireAdmin } from '@/lib/admin-auth'
import { hashPassword } from '@/lib/auth'

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { error } = requireAdmin(request)
  if (error) return error

  const { id } = await params

  try {
    const { username, password, displayName, isAdmin } = await request.json()

    const data: Record<string, unknown> = {}

    if (username) data.username = username
    if (displayName) data.displayName = displayName
    if (isAdmin !== undefined) data.isAdmin = isAdmin
    if (password) {
      data.password = await hashPassword(password)
    }

    const user = await prisma.user.update({
      where: { id: parseInt(id) },
      data,
      select: {
        id: true,
        username: true,
        displayName: true,
        isAdmin: true,
        createdAt: true,
      },
    })

    return NextResponse.json({ user })
  } catch {
    return NextResponse.json({ error: '更新用户失败' }, { status: 500 })
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { error } = requireAdmin(request)
  if (error) return error

  const { id } = await params

  try {
    await prisma.user.delete({
      where: { id: parseInt(id) },
    })

    return NextResponse.json({ success: true })
  } catch {
    return NextResponse.json({ error: '删除用户失败' }, { status: 500 })
  }
}
