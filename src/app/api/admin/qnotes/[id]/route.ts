import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireAdmin } from '@/lib/admin-auth'

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
