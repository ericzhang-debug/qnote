import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ shareId: string }> }
) {
  try {
    const { shareId } = await params

    const qnote = await prisma.qnote.findUnique({
      where: { shareId },
      include: {
        user: {
          select: {
            displayName: true,
            username: true,
          },
        },
      },
    })

    if (!qnote) {
      return NextResponse.json(
        { error: '微语不存在' },
        { status: 404 }
      )
    }

    return NextResponse.json({ qnote })
  } catch {
    return NextResponse.json(
      { error: '获取微语失败' },
      { status: 500 }
    )
  }
}
