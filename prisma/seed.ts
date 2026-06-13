import { PrismaClient } from '@prisma/client'
import { PrismaLibSql } from '@prisma/adapter-libsql'
import bcrypt from 'bcryptjs'

const adapter = new PrismaLibSql({
  url: process.env.DATABASE_URL || 'file:./prisma/dev.db',
})

const prisma = new PrismaClient({ adapter })

async function main() {
  const hashedPassword = await bcrypt.hash('admin123', 10)

  const admin = await prisma.user.upsert({
    where: { username: 'admin' },
    update: {},
    create: {
      username: 'admin',
      password: hashedPassword,
      displayName: '管理员',
      isAdmin: true,
    },
  })

  console.log('✅ 默认管理员用户已创建:')
  console.log(`   用户名: admin`)
  console.log(`   密码: admin123`)
  console.log(`   显示名称: ${admin.displayName}`)
  console.log(`   管理员: ${admin.isAdmin}`)

  await prisma.setting.upsert({
    where: { id: 1 },
    update: {},
    create: {
      id: 1,
      siteName: 'QNote',
      siteTitle: 'QNote - 微语',
      siteSubtitle: '记录生活中的每一句微语',
    },
  })

  console.log('✅ 默认系统配置已创建')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
