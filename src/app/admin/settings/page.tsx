'use client'

import { useEffect, useState } from 'react'
import { Save } from 'lucide-react'

interface Settings {
  siteName: string
  siteTitle: string
  siteSubtitle: string
  showIcp: boolean
  icpNumber: string
  showGithub: boolean
  githubUrl: string
}

export default function SettingsPage() {
  const [settings, setSettings] = useState<Settings | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)

  useEffect(() => {
    fetchSettings()
  }, [])

  async function fetchSettings() {
    setLoading(true)
    try {
      const token = document.cookie.split('token=')[1]?.split(';')[0]
      const res = await fetch('/api/admin/settings', {
        headers: { Authorization: `Bearer ${token}` },
      })
      if (!res.ok) {
        throw new Error(`HTTP ${res.status}`)
      }
      const text = await res.text()
      if (!text) throw new Error('Empty response')
      const data = JSON.parse(text)
      setSettings(data.settings)
    } catch (err) {
      console.error('获取配置失败', err)
    } finally {
      setLoading(false)
    }
  }

  async function handleSave() {
    if (!settings) return
    setSaving(true)
    setSaved(false)
    try {
      const token = document.cookie.split('token=')[1]?.split(';')[0]
      const res = await fetch('/api/admin/settings', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(settings),
      })
      if (res.ok) {
        setSaved(true)
        setTimeout(() => setSaved(false), 2000)
      }
    } catch (err) {
      console.error(err)
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <div className="w-6 h-6 border-2 border-slate-300 border-t-slate-600 rounded-full animate-spin" />
      </div>
    )
  }

  return (
    <div className="max-w-2xl mx-auto">
      <h1 className="text-xl font-bold text-slate-800 dark:text-slate-100 mb-6">系统配置</h1>

      <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-6 space-y-5">
        {/* 基本设置 */}
        <div>
          <h2 className="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-3 pb-2 border-b border-slate-100 dark:border-slate-700">
            基本设置
          </h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm text-slate-600 dark:text-slate-400 mb-1">网站名称</label>
              <input
                type="text"
                value={settings?.siteName || ''}
                onChange={(e) => setSettings(prev => prev ? { ...prev, siteName: e.target.value } : prev)}
                className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-700 text-sm text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-slate-400"
              />
            </div>
            <div>
              <label className="block text-sm text-slate-600 dark:text-slate-400 mb-1">网站标题（浏览器标签栏）</label>
              <input
                type="text"
                value={settings?.siteTitle || ''}
                onChange={(e) => setSettings(prev => prev ? { ...prev, siteTitle: e.target.value } : prev)}
                className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-700 text-sm text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-slate-400"
              />
            </div>
            <div>
              <label className="block text-sm text-slate-600 dark:text-slate-400 mb-1">副标题</label>
              <input
                type="text"
                value={settings?.siteSubtitle || ''}
                onChange={(e) => setSettings(prev => prev ? { ...prev, siteSubtitle: e.target.value } : prev)}
                className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-700 text-sm text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-slate-400"
              />
            </div>
          </div>
        </div>

        {/* 页脚设置 */}
        <div>
          <h2 className="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-3 pb-2 border-b border-slate-100 dark:border-slate-700">
            页脚设置
          </h2>
          <div className="space-y-4">
            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={settings?.showIcp || false}
                onChange={(e) => setSettings(prev => prev ? { ...prev, showIcp: e.target.checked } : prev)}
                className="rounded border-slate-300 w-4 h-4"
              />
              <span className="text-sm text-slate-600 dark:text-slate-400">显示备案号</span>
            </label>
            {settings?.showIcp && (
              <div>
                <label className="block text-sm text-slate-600 dark:text-slate-400 mb-1">备案号</label>
                <input
                  type="text"
                  value={settings?.icpNumber || ''}
                  onChange={(e) => setSettings(prev => prev ? { ...prev, icpNumber: e.target.value } : prev)}
                  placeholder="例如：京ICP备XXXXXXXX号"
                  className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-700 text-sm text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-slate-400"
                />
              </div>
            )}
            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={settings?.showGithub || false}
                onChange={(e) => setSettings(prev => prev ? { ...prev, showGithub: e.target.checked } : prev)}
                className="rounded border-slate-300 w-4 h-4"
              />
              <span className="text-sm text-slate-600 dark:text-slate-400">
                显示 GitHub 仓库链接
                {/* <span className="ml-1 text-slate-400">github.com/ericzhang-debug/qnote</span> */}
              </span>
            </label>
          </div>
        </div>

        {/* Save button */}
        <div className="flex items-center gap-3 pt-2">
          <button
            onClick={handleSave}
            disabled={saving}
            className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-slate-800 dark:bg-slate-200 text-white dark:text-slate-900 text-sm font-medium hover:bg-slate-700 dark:hover:bg-slate-300 disabled:opacity-50 transition-colors"
          >
            <Save className="w-4 h-4" />
            {saving ? '保存中...' : '保存配置'}
          </button>
          {saved && (
            <span className="text-sm text-green-600 dark:text-green-400">已保存 ✓</span>
          )}
        </div>
      </div>
    </div>
  )
}
