import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
  let settings = await prisma.setting.findUnique({ where: { id: 1 } })

  if (!settings) {
    settings = await prisma.setting.create({
      data: { id: 1 },
    })
  }

  return NextResponse.json({
    siteName: settings.siteName,
    siteSubtitle: settings.siteSubtitle,
    showIcp: settings.showIcp,
    icpNumber: settings.icpNumber,
    showGithub: settings.showGithub,
  })
}
