'use client'

import { useEffect, useState } from 'react'
import { format } from 'date-fns'
import { zhCN } from 'date-fns/locale'
import { Heart } from 'lucide-react'

interface Qnote {
  id: number
  content: string
  shareId: string
  createdAt: string
  user: {
    displayName: string
    username: string
  }
}

interface Pagination {
  page: number
  totalPages: number
  total: number
}

interface SiteSettings {
  siteName: string
  siteSubtitle: string
  showIcp: boolean
  icpNumber: string
  showGithub: boolean
}

export default function Home() {
  const [qnotes, setQnotes] = useState<Qnote[]>([])
  const [pagination, setPagination] = useState<Pagination | null>(null)
  const [loading, setLoading] = useState(true)
  const [settings, setSettings] = useState<SiteSettings | null>(null)

  useEffect(() => {
    fetchQnotes()
    fetchSettings()
  }, [])

  async function fetchSettings() {
    try {
      const res = await fetch('/api/public/settings')
      const data = await res.json()
      setSettings(data)
    } catch {}
  }

  async function fetchQnotes(page = 1) {
    setLoading(true)
    try {
      const res = await fetch(`/api/qnotes?page=${page}&pageSize=50`)
      const data = await res.json()
      setQnotes(data.qnotes)
      setPagination(data.pagination)
    } catch (err) {
      console.error('Failed to fetch qnotes', err)
    } finally {
      setLoading(false)
    }
  }

  function formatDate(dateStr: string) {
    const date = new Date(dateStr)
    const now = new Date()
    const diff = now.getTime() - date.getTime()
    const days = Math.floor(diff / (1000 * 60 * 60 * 24))

    if (days === 0) {
      return `今天 ${format(date, 'HH:mm')}`
    } else if (days === 1) {
      return `昨天 ${format(date, 'HH:mm')}`
    } else if (days < 7) {
      return `${days}天前`
    } else {
      return format(date, 'yyyy年M月d日', { locale: zhCN })
    }
  }

  return (
    <div className="flex-1">
      {/* Header */}
      <header className="relative border-b border-slate-200/60 dark:border-slate-700/30">
        <div className="max-w-2xl mx-auto px-4 py-12 text-center">
          <h1 className="text-3xl font-bold tracking-tight text-slate-800 dark:text-slate-100">
            {settings?.siteName || 'QNote'}
          </h1>
          <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
            {settings?.siteSubtitle || '记录生活中的每一句微语'}
          </p>
        </div>
      </header>

      {/* Timeline */}
      <main className="max-w-2xl mx-auto px-4 py-8">
        {loading ? (
          <div className="flex justify-center py-20">
            <div className="w-6 h-6 border-2 border-slate-300 border-t-slate-600 rounded-full animate-spin" />
          </div>
        ) : qnotes.length === 0 ? (
          <div className="text-center py-20">
            <Heart className="w-12 h-12 mx-auto text-slate-300 dark:text-slate-600" />
            <p className="mt-4 text-slate-400 dark:text-slate-500">还没有微语，快来写下第一句吧</p>
          </div>
        ) : (
          <div className="relative">
            {/* Timeline line */}
            <div className="absolute left-[18px] top-2 bottom-2 w-0.5 bg-gradient-to-b from-slate-200 via-slate-300 to-slate-200 dark:from-slate-700 dark:via-slate-600 dark:to-slate-700" />

            {/* Qnote cards */}
            <div className="space-y-6">
              {qnotes.map((qnote) => (
                <div key={qnote.id} className="relative pl-12 group">
                  {/* Timeline dot */}
                  <div className="absolute left-[11px] top-2 w-[15px] h-[15px] rounded-full border-2 border-slate-300 dark:border-slate-500 bg-white dark:bg-slate-800 group-hover:border-sky-400 dark:group-hover:border-sky-400 group-hover:bg-sky-50 dark:group-hover:bg-sky-950/30 transition-colors duration-300 z-10" />

                  {/* Card */}
                  <div className="bg-white dark:bg-slate-800/80 rounded-xl border border-slate-200/60 dark:border-slate-700/30 p-5 shadow-sm hover:shadow-md hover:border-slate-300/60 dark:hover:border-slate-600/30 transition-all duration-300">
                    <p className="text-base leading-relaxed text-slate-700 dark:text-slate-200 whitespace-pre-wrap break-words">
                      {qnote.content}
                    </p>
                    <div className="mt-3 flex items-center justify-between text-xs text-slate-400 dark:text-slate-500">
                      <span className="font-medium text-slate-400 dark:text-slate-500">
                        {qnote.user.displayName}
                      </span>
                      <time>{formatDate(qnote.createdAt)}</time>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Pagination */}
        {pagination && pagination.totalPages > 1 && (
          <div className="flex justify-center gap-2 mt-8">
            {Array.from({ length: pagination.totalPages }, (_, i) => i + 1).map((p) => (
              <button
                key={p}
                onClick={() => fetchQnotes(p)}
                className={`px-3 py-1 text-sm rounded-lg transition-colors ${
                  p === pagination.page
                    ? 'bg-slate-800 text-white dark:bg-slate-200 dark:text-slate-900'
                    : 'text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800'
                }`}
              >
                {p}
              </button>
            ))}
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-200/60 dark:border-slate-700/30 py-6 text-center text-xs text-slate-400 dark:text-slate-600 space-y-1">
        <p>{settings?.siteName || 'QNote'} · 微语</p>
        {settings?.showIcp && settings?.icpNumber && (
          <p>
            <a
              href="https://beian.miit.gov.cn/"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-slate-600 dark:hover:text-slate-400 transition-colors"
            >
              {settings.icpNumber}
            </a>
          </p>
        )}
        {settings?.showGithub && (
          <p>
            <a
              href="https://github.com/ericzhang-debug/qnote"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 hover:text-slate-600 dark:hover:text-slate-400 transition-colors"
            >
              <svg viewBox="0 0 24 24" className="w-3.5 h-3.5 fill-current" aria-hidden="true">
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
