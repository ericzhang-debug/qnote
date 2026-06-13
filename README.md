# ✦ QNote — 微语平台

简洁美观的微语记录平台。以时间轴方式记录生活中的每一句微语，支持独一无二的分享链接和 RESTful API 发布。

## 功能特性

### 🏠 首页时间轴
- 纵向时间线展示微语，时间显示在时间轴左侧
- 圆点 hover 动效，日夜双主题
- 自动分页，按时间倒序排列

### 🔗 分享链接
- 每条微语自动生成唯一 `shareId`
- 打开即见唯美独立页面（引号装饰 + 渐变色背景）
- 支持 Open Graph 元标签（分享到社交平台可预览）

### 🔐 管理后台
- 侧边栏布局，响应式适配移动端
- 微语管理：发布、编辑、删除、一键复制分享链接
- 用户管理：创建/编辑/删除
- API 密钥管理：生成 appKey/appSecret
- 系统配置：网站名称、标题、副标题、备案号、GitHub 链接

### 🌐 RESTful API
- 通过 `X-APP-KEY` + `X-APP-SECRET` 认证
- 支持外部系统通过 API 发布微语

## 技术栈

| 技术 | 用途 |
|------|------|
| **Next.js 16** (App Router) | 全栈框架 |
| **TypeScript** | 类型安全 |
| **Prisma 7** | ORM（支持 SQLite / PostgreSQL / MySQL） |
| **Tailwind CSS 4** | 原子化样式 |
| **shadcn/ui** | UI 组件库 |
| **JWT** | 认证鉴权 |
| **bcryptjs** | 密码哈希 |

## 快速开始

### 前置要求

- Node.js 18+
- pnpm

### 安装运行（SQLite 默认）

```bash
# 安装依赖
pnpm install

# 初始化数据库（迁移 + 种子数据）
pnpm prisma migrate dev

# 创建默认管理员用户
pnpm seed

# 启动开发服务器
pnpm dev
```

### 切换其他数据库

内置支持 SQLite、PostgreSQL 和 MySQL/MariaDB，切换只需改两个文件：

<details>
<summary><b>切换到 PostgreSQL</b></summary>

**1. 修改 `prisma/schema.prisma`**

```prisma
datasource db {
  provider = "postgresql"   // ← 改为 postgresql
}
```

**2. 修改 `.env`**

```env
DATABASE_PROVIDER=postgresql
DATABASE_URL="postgresql://user:password@localhost:5432/qnote"
```

**3. 运行迁移**

```bash
pnpm prisma generate
pnpm prisma migrate dev --name init
pnpm seed
```
</details>

<details>
<summary><b>切换到 MySQL / MariaDB</b></summary>

**1. 修改 `prisma/schema.prisma`**

```prisma
datasource db {
  provider = "mysql"   // ← 改为 mysql
}
```

**2. 修改 `.env`**

```env
DATABASE_PROVIDER=mysql
DATABASE_URL="mysql://user:password@localhost:3306/qnote"
```

**3. 运行迁移**

```bash
pnpm prisma generate
pnpm prisma migrate dev --name init
pnpm seed
```
</details>

### 适配器对照表

| 数据库 | schema provider | npm 适配器 | 驱动 |
|--------|----------------|------------|------|
| SQLite | `sqlite` | `@prisma/adapter-libsql` | `@libsql/client` |
| PostgreSQL | `postgresql` | `@prisma/adapter-pg` | `pg` |
| MySQL / MariaDB | `mysql` | `@prisma/adapter-mariadb` | `mariadb` |

> 适配器按需动态加载，未使用的驱动不会影响运行。

### 初始化账号

运行 `pnpm seed` 后会自动创建：

| 用户名 | 密码 | 角色 |
|--------|------|------|
| `admin` | `admin123` | 超级管理员 |

> ⚠️ 生产环境请务必修改密码和 `JWT_SECRET`！

### 访问地址

| 地址 | 说明 |
|------|------|
| `http://localhost:3000` | 首页时间轴 |
| `http://localhost:3000/share/:shareId` | 微语分享页 |
| `http://localhost:3000/admin/login` | 管理后台登录 |
| `http://localhost:3000/admin` | 微语管理 |
| `http://localhost:3000/admin/users` | 用户管理 |
| `http://localhost:3000/admin/api-keys` | API 密钥管理 |
| `http://localhost:3000/admin/settings` | 系统配置 |
| `http://localhost:3000/admin/api-docs` | API 文档 |

## RESTful API 使用

### 通过 API 发布微语

先在管理后台创建 API 密钥，然后：

```bash
curl -X POST http://localhost:3000/api/qnotes \
  -H "Content-Type: application/json" \
  -H "X-APP-KEY: qk_your_app_key" \
  -H "X-APP-SECRET: qs_your_app_secret" \
  -d '{"content": "你好，世界！"}'
```

### 获取微语列表

```bash
curl http://localhost:3000/api/qnotes?page=1&pageSize=20
```

## 数据库模型

```prisma
User     — 用户
Qnote    — 微语（内容 / 分享ID / 发布者）
ApiKey   — API 密钥（appKey / appSecret / 所属用户）
Setting  — 系统配置（网站名称 / 备案号 / GitHub 链接）
```

## 项目结构

```
qnote/
├── prisma/
│   ├── schema.prisma          # 数据库模型
│   ├── migrations/            # 迁移记录
│   ├── seed.ts                # 种子脚本
│   └── dev.db                 # SQLite 数据库
├── src/
│   ├── app/
│   │   ├── page.tsx           # 首页时间轴
│   │   ├── share/[shareId]/   # 分享页
│   │   ├── admin/             # 管理后台
│   │   │   ├── login/         # 登录页
│   │   │   ├── page.tsx       # 微语管理
│   │   │   ├── users/         # 用户管理
│   │   │   ├── api-keys/      # API 密钥管理
│   │   │   ├── settings/      # 系统配置
│   │   │   └── api-docs/      # API 文档
│   │   └── api/               # API 路由
│   ├── lib/
│   │   ├── prisma.ts          # Prisma 客户端（自动适配数据库）
│   │   ├── auth.ts            # JWT 工具
│   │   ├── admin-auth.ts      # 后台认证
│   │   └── api-auth.ts        # API 密钥认证
│   ├── proxy.ts               # 路由保护
│   └── components/ui/         # UI 组件
├── .env                       # 环境变量
├── prisma.config.ts           # Prisma 配置
└── next.config.ts             # Next.js 配置
```

## 开发

```bash
# 开发服务器
pnpm dev

# 构建
pnpm build

# 数据库迁移
pnpm prisma migrate dev --name 迁移名称

# 查看数据库
pnpm prisma studio

# 初始化种子数据
pnpm seed
```

## 许可

MIT
