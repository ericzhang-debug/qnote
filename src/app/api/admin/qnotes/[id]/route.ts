import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireAdmin } from '@/lib/admin-auth'

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { error } = requireAdmin(request)
  if (error) return error

  const { id } = await params

  try {
    const { content, isPublic } = await request.json()

    if (!content || !content.trim()) {
      return NextResponse.json({ error: '内容不能为空' }, { status: 400 })
    }

    const qnote = await prisma.qnote.update({
      where: { id: parseInt(id) },
      data: {
        content: content.trim(),
        ...(isPublic !== undefined ? { isPublic } : {}),
      },
      include: {
        user: {
          select: { displayName: true, username: true },
        },
      },
    })

    return NextResponse.json({ qnote })
  } catch {
    return NextResponse.json({ error: '编辑微语失败' }, { status: 500 })
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
    await prisma.qnote.delete({
      where: { id: parseInt(id) },
    })

    return NextResponse.json({ success: true })
  } catch {
    return NextResponse.json({ error: '删除微语失败' }, { status: 500 })
  }
}
