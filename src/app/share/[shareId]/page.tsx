import { prisma } from '@/lib/prisma'
import { notFound } from 'next/navigation'

/** 从 shareId 生成唯一 HSL 色值 */
function hashColor(shareId: string): { hue: number; sat: number; light: number } {
  let hash = 0
  for (let i = 0; i < shareId.length; i++) {
    hash = ((hash << 5) - hash) + shareId.charCodeAt(i)
    hash |= 0
  }
  const hue = Math.abs(hash) % 360
  const sat = 55 + (Math.abs(hash >> 8) % 30) // 55-85
  const light = 60 + (Math.abs(hash >> 16) % 20) // 60-80
  return { hue, sat, light }
}

async function getSettings() {
  try {
    const settings = await prisma.setting.findUnique({ where: { id: 1 } })
    return {
      siteName: settings?.siteName || 'QNote',
      showIcp: settings?.showIcp || false,
      icpNumber: settings?.icpNumber || '',
      showGithub: settings?.showGithub || false,
      githubUrl: settings?.githubUrl || '',
    }
  } catch {
    return { siteName: 'QNote', showIcp: false, icpNumber: '', showGithub: false, githubUrl: '' }
  }
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ shareId: string }>
}) {
  const { shareId } = await params
  const qnote = await prisma.qnote.findUnique({
    where: { shareId },
    include: { user: true },
  })

  if (!qnote) return { title: '微语不存在 - QNote' }

  return {
    title: `${qnote.user.displayName} 的微语 - ${(await getSettings()).siteName}`,
    description: qnote.content.slice(0, 100),
    openGraph: {
      title: `${qnote.user.displayName} 的微语`,
      description: qnote.content.slice(0, 100),
      type: 'article',
      publishedTime: qnote.createdAt.toISOString(),
    },
  }
}

export default async function SharePage({
  params,
}: {
  params: Promise<{ shareId: string }>
}) {
  const { shareId } = await params
  const qnote = await prisma.qnote.findUnique({
    where: { shareId, isPublic: true },
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
    notFound()
  }

  const { hue, sat, light } = hashColor(shareId)
  const bgLight = `hsl(${hue}, ${sat}%, ${light}%)`
  const bgMid = `hsl(${hue}, ${sat + 5}%, ${light - 10}%)`
  const quoteColor = `hsl(${hue}, ${sat}%, ${light - 20}%)`
  const borderColor = `hsl(${hue}, ${sat - 10}%, ${light - 5}%)`
  const textColor = `hsl(${hue}, ${sat + 10}%, ${light - 40}%)`
  const metaColor = `hsl(${hue}, ${sat}%, ${light - 35}%)`

  const formattedDate = new Intl.DateTimeFormat('zh-CN', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    timeZone: 'Asia/Shanghai',
  }).format(qnote.createdAt)
  const settings = await getSettings()

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-slate-50 via-white to-slate-100 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950 p-4">
      <div className="w-full max-w-lg flex-1 flex items-center">
        {/* Card */}
        <div className="w-full bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm rounded-2xl shadow-xl p-8 md:p-10 relative overflow-hidden"
          style={{ borderColor }}>
          {/* Decorative elements */}
          <div
            className="absolute -top-20 -right-20 w-40 h-40 rounded-full blur-2xl opacity-40"
            style={{
              background: `linear-gradient(135deg, ${bgLight}, ${bgMid})`,
            }}
          />
          <div
            className="absolute -bottom-20 -left-20 w-40 h-40 rounded-full blur-2xl opacity-40"
            style={{
              background: `linear-gradient(to top right, ${bgLight}, ${bgMid})`,
            }}
          />

          {/* Content */}
          <div className="relative">
            {/* Quote mark */}
            <div
              className="text-5xl leading-none mb-2 opacity-50"
              style={{ color: quoteColor }}
            >
              &ldquo;
            </div>

            {/* Content */}
            <p
              className="text-lg md:text-xl leading-relaxed whitespace-pre-wrap break-words font-serif tracking-wide"
              style={{ color: textColor }}
            >
              {qnote.content}
            </p>

            {/* Closing quote */}
            <div
              className="text-5xl leading-none text-right mt-2 opacity-50"
              style={{ color: quoteColor }}
            >
              &rdquo;
            </div>

            {/* Divider */}
            <div
              className="my-6 border-t opacity-50"
              style={{ borderColor }}
            />

            {/* Footer info */}
            <div className="flex items-center justify-between">
              <div>
                <p
                  className="text-sm font-medium"
                  style={{ color: metaColor }}
                >
                  {qnote.user.displayName}
                </p>
                <p className="text-xs text-slate-400 dark:text-slate-500 mt-0.5">
                  {formattedDate}
                </p>
              </div>
              <div className="text-xs text-slate-300 dark:text-slate-600 font-mono">
                {settings.siteName}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="text-center text-xs text-slate-400 dark:text-slate-600 mt-6 pb-4 space-y-1">
        <p>✦ 来自 {settings.siteName}</p>
        {settings.showIcp && settings.icpNumber && (
          <p>
            <a
              href="https://beian.miit.gov.cn/"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-slate-500"
            >
              {settings.icpNumber}
            </a>
          </p>
        )}
        {settings.showGithub && (
          <p>
            <a
              href="https://github.com/ericzhang-debug/qnote"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 hover:text-slate-500"
            >
              <svg viewBox="0 0 24 24" className="w-3 h-3 fill-current" aria-hidden="true">
                <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z" />
              </svg>
              自豪地采用QNote
            </a>
          </p>
        )}
      </footer>
    </div>
  )
}
