import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireAdmin } from '@/lib/admin-auth'

export async function GET(request: Request) {
  try {
    const { error } = requireAdmin(request)
    if (error) return error

    let settings = await prisma.setting.findUnique({ where: { id: 1 } })

    if (!settings) {
      settings = await prisma.setting.create({
        data: { id: 1 },
      })
    }

    return NextResponse.json({ settings })
  } catch (err) {
    console.error('GET settings error:', err)
    return NextResponse.json({ settings: null, error: '获取配置失败' }, { status: 500 })
  }
}

export async function PUT(request: Request) {
  const { error } = requireAdmin(request)
  if (error) return error

  try {
    const body = await request.json()
    const allowed = ['siteName', 'siteTitle', 'siteSubtitle', 'showIcp', 'icpNumber', 'showGithub', 'githubUrl']

    const data: Record<string, unknown> = {}
    for (const key of allowed) {
      if (body[key] !== undefined) {
        data[key] = body[key]
      }
    }

    const settings = await prisma.setting.upsert({
      where: { id: 1 },
      update: data,
      create: { id: 1, ...data },
    })

    return NextResponse.json({ settings })
  } catch {
    return NextResponse.json({ error: '保存配置失败' }, { status: 500 })
  }
}
