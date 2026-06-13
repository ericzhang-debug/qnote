import { prisma } from '@/lib/prisma'
import { notFound } from 'next/navigation'
import { format } from 'date-fns'
import { zhCN } from 'date-fns/locale'

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
    title: `${qnote.user.displayName} 的微语 - QNote`,
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

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-50 via-white to-purple-50 dark:from-slate-950 dark:via-slate-900 dark:to-indigo-950 p-4">
      <div className="w-full max-w-lg">
        {/* Card */}
        <div className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm rounded-2xl border border-slate-200/60 dark:border-slate-700/30 shadow-xl p-8 md:p-10 relative overflow-hidden">
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
                QNote
              </div>
            </div>
          </div>
        </div>

        {/* Bottom text */}
        <p className="text-center text-xs text-slate-400 dark:text-slate-600 mt-6">
          ✦ 来自 QNote 微语
        </p>
      </div>
    </div>
  )
}
