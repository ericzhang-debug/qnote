import { prisma } from '@/lib/prisma'
import { notFound } from 'next/navigation'
import { format } from 'date-fns'
import { zhCN } from 'date-fns/locale'

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

  const formattedDate = format(qnote.createdAt, 'yyyy年M月d日 HH:mm', { locale: zhCN })
  const settings = await getSettings()

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-indigo-50 via-white to-purple-50 dark:from-slate-950 dark:via-slate-900 dark:to-indigo-950 p-4">
      <div className="w-full max-w-lg flex-1 flex items-center">
        {/* Card */}
        <div className="w-full bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm rounded-2xl border border-slate-200/60 dark:border-slate-700/30 shadow-xl p-8 md:p-10 relative overflow-hidden">
          {/* Decorative elements */}
          <div className="absolute -top-20 -right-20 w-40 h-40 bg-gradient-to-br from-indigo-100 to-purple-100 dark:from-indigo-900/20 dark:to-purple-900/20 rounded-full blur-2xl" />
          <div className="absolute -bottom-20 -left-20 w-40 h-40 bg-gradient-to-tr from-amber-100 to-rose-100 dark:from-amber-900/20 dark:to-rose-900/20 rounded-full blur-2xl" />

          {/* Content */}
          <div className="relative">
            {/* Quote mark */}
            <div className="text-5xl leading-none text-indigo-200 dark:text-indigo-700/50 mb-2">
              &ldquo;
            </div>

            {/* Content */}
            <p className="text-lg md:text-xl leading-relaxed text-slate-700 dark:text-slate-200 whitespace-pre-wrap break-words font-serif tracking-wide">
              {qnote.content}
            </p>

            {/* Closing quote */}
            <div className="text-5xl leading-none text-indigo-200 dark:text-indigo-700/50 text-right mt-2">
              &rdquo;
            </div>

            {/* Divider */}
            <div className="my-6 border-t border-slate-100 dark:border-slate-700/30" />

            {/* Footer info */}
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-600 dark:text-slate-300">
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
        <p>来自 {settings.siteName}</p>
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
