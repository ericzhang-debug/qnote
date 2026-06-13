'use client'

import { useEffect, useState } from 'react'
import { Plus, Trash2, Link as LinkIcon, Copy, Check } from 'lucide-react'

interface Qnote {
  id: number
  content: string
  shareId: string
  isPublic: boolean
  createdAt: string
  user: { displayName: string; username: string }
}

export default function AdminDashboard() {
  const [qnotes, setQnotes] = useState<Qnote[]>([])
  const [loading, setLoading] = useState(true)
  const [content, setContent] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [copiedId, setCopiedId] = useState<string | null>(null)

  useEffect(() => {
    fetchQnotes()
  }, [])

  async function fetchQnotes() {
    setLoading(true)
    try {
      const token = document.cookie.split('token=')[1]?.split(';')[0]
      const res = await fetch('/api/admin/qnotes', {
        headers: { Authorization: `Bearer ${token}` },
      })
      const data = await res.json()
      if (!res.ok) {
        setLoading(false)
        return
      }
      setQnotes(data.qnotes || [])
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  async function createQnote() {
    if (!content.trim()) return
    setSubmitting(true)
    try {
      const token = document.cookie.split('token=')[1]?.split(';')[0]
      const res = await fetch('/api/admin/qnotes', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ content: content.trim() }),
      })
      if (res.ok) {
        setContent('')
        fetchQnotes()
      }
    } catch (err) {
      console.error(err)
    } finally {
      setSubmitting(false)
    }
  }

  async function deleteQnote(id: number) {
    if (!confirm('确定删除这条微语？')) return
    try {
      const token = document.cookie.split('token=')[1]?.split(';')[0]
      await fetch(`/api/admin/qnotes/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      })
      fetchQnotes()
    } catch (err) {
      console.error(err)
    }
  }

  function copyShareLink(shareId: string) {
    const url = `${window.location.origin}/share/${shareId}`
    navigator.clipboard.writeText(url)
    setCopiedId(shareId)
    setTimeout(() => setCopiedId(null), 2000)
  }

  function formatDate(dateStr: string) {
    const d = new Date(dateStr)
    return d.toLocaleString('zh-CN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  return (
    <div className="max-w-4xl mx-auto">
      <h1 className="text-xl font-bold text-slate-800 dark:text-slate-100 mb-6">
        微语管理
      </h1>

      {/* Create qnote */}
      <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-4 mb-6">
        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="写下新的微语..."
          className="w-full min-h-[80px] p-3 rounded-lg border border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-700 text-sm text-slate-700 dark:text-slate-200 resize-none focus:outline-none focus:ring-2 focus:ring-slate-400 dark:focus:ring-slate-500 placeholder:text-slate-400"
          maxLength={500}
        />
        <div className="flex items-center justify-between mt-3">
          <span className="text-xs text-slate-400">{content.length}/500</span>
          <button
            onClick={createQnote}
            disabled={!content.trim() || submitting}
            className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-slate-800 dark:bg-slate-200 text-white dark:text-slate-900 text-sm font-medium hover:bg-slate-700 dark:hover:bg-slate-300 disabled:opacity-50 transition-colors"
          >
            <Plus className="w-4 h-4" />
            {submitting ? '发布中...' : '发布'}
          </button>
        </div>
      </div>

      {/* Qnote list */}
      {loading ? (
        <div className="flex justify-center py-12">
          <div className="w-6 h-6 border-2 border-slate-300 border-t-slate-600 rounded-full animate-spin" />
        </div>
      ) : qnotes.length === 0 ? (
        <div className="text-center py-12 text-slate-400 dark:text-slate-500">
          还没有微语
        </div>
      ) : (
        <div className="space-y-3">
          {qnotes.map((qnote) => (
            <div
              key={qnote.id}
              className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-4 group"
            >
              <p className="text-sm text-slate-700 dark:text-slate-200 whitespace-pre-wrap break-words mb-3">
                {qnote.content}
              </p>
              <div className="flex items-center justify-between text-xs text-slate-400">
                <div className="flex items-center gap-3">
                  <span>{qnote.user.displayName}</span>
                  <span>·</span>
                  <span>{formatDate(qnote.createdAt)}</span>
                </div>
                <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button
                    onClick={() => copyShareLink(qnote.shareId)}
                    className="p-1.5 rounded-md hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300"
                    title="复制分享链接"
                  >
                    {copiedId === qnote.shareId ? (
                      <Check className="w-3.5 h-3.5 text-green-500" />
                    ) : (
                      <Copy className="w-3.5 h-3.5" />
                    )}
                  </button>
                  <a
                    href={`/share/${qnote.shareId}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-1.5 rounded-md hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300"
                    title="打开分享页"
                  >
                    <LinkIcon className="w-3.5 h-3.5" />
                  </a>
                  <button
                    onClick={() => deleteQnote(qnote.id)}
                    className="p-1.5 rounded-md hover:bg-red-50 dark:hover:bg-red-950/30 text-slate-400 hover:text-red-500"
                    title="删除"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
