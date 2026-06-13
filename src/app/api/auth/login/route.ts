import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { verifyPassword, generateToken } from '@/lib/auth'

export async function POST(request: Request) {
  try {
    const { username, password } = await request.json()

    if (!username || !password) {
      return NextResponse.json(
        { error: '用户名和密码不能为空' },
        { status: 400 }
      )
    }

    const user = await prisma.user.findUnique({
      where: { username },
    })

    if (!user) {
      return NextResponse.json(
        { error: '用户名或密码错误' },
        { status: 401 }
      )
    }

    const isValid = await verifyPassword(password, user.password)

    if (!isValid) {
      return NextResponse.json(
        { error: '用户名或密码错误' },
        { status: 401 }
      )
    }

    if (!user.isAdmin) {
      return NextResponse.json(
        { error: '无管理员权限，无法登录后台' },
        { status: 403 }
      )
    }

    const token = generateToken({
      userId: user.id,
      username: user.username,
      isAdmin: user.isAdmin,
    })

    return NextResponse.json({
      token,
      user: {
        id: user.id,
        username: user.username,
        displayName: user.displayName,
        isAdmin: user.isAdmin,
      },
    })
  } catch {
    return NextResponse.json(
      { error: '登录失败' },
      { status: 500 }
    )
  }
}
