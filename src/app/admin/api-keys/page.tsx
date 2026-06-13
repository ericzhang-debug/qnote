'use client'

import { useEffect, useState } from 'react'
import { Plus, Trash2, Copy, Check, Eye, EyeOff } from 'lucide-react'

interface ApiKey {
  id: number
  name: string
  appKey: string
  appSecret: string
  isActive: boolean
  createdAt: string
  user: { id: number; displayName: string; username: string }
}

interface User {
  id: number
  username: string
  displayName: string
}

export default function ApiKeysPage() {
  const [apiKeys, setApiKeys] = useState<ApiKey[]>([])
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [form, setForm] = useState({ name: '', userId: '' })
  const [newKeyResult, setNewKeyResult] = useState<{
    appKey: string
    appSecret: string
    message: string
  } | null>(null)
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    fetchData()
  }, [])

  async function fetchData() {
    setLoading(true)
    try {
      const token = document.cookie.split('token=')[1]?.split(';')[0]
      const [keysRes, usersRes] = await Promise.all([
        fetch('/api/admin/api-keys', {
          headers: { Authorization: `Bearer ${token}` },
        }),
        fetch('/api/admin/users', {
          headers: { Authorization: `Bearer ${token}` },
        }),
      ])
      const keysData = await keysRes.json()
      const usersData = await usersRes.json()
      setApiKeys(keysData.apiKeys)
      setUsers(usersData.users)
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  function openCreate() {
    setForm({ name: '', userId: '' })
    setNewKeyResult(null)
    setShowModal(true)
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    const token = document.cookie.split('token=')[1]?.split(';')[0]
    const res = await fetch('/api/admin/api-keys', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify(form),
    })
    const data = await res.json()

    if (res.ok) {
      setNewKeyResult({
        appKey: data.apiKey.appKey,
        appSecret: data.apiKey.appSecret,
        message: data.message,
      })
      fetchData()
    }
  }

  async function deleteKey(id: number) {
    if (!confirm('确定删除此 API 密钥？')) return
    const token = document.cookie.split('token=')[1]?.split(';')[0]
    await fetch(`/api/admin/api-keys/${id}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${token}` },
    })
    fetchData()
  }

  function copyToClipboard(text: string) {
    navigator.clipboard.writeText(text)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="max-w-4xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-xl font-bold text-slate-800 dark:text-slate-100">API 密钥管理</h1>
        <button
          onClick={openCreate}
          className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-slate-800 dark:bg-slate-200 text-white dark:text-slate-900 text-sm font-medium hover:bg-slate-700 dark:hover:bg-slate-300 transition-colors"
        >
          <Plus className="w-4 h-4" />
          新建密钥
        </button>
      </div>

      {/* Create modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/30 z-50 flex items-center justify-center p-4" onClick={() => setShowModal(false)}>
          <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 shadow-xl w-full max-w-lg p-6" onClick={(e) => e.stopPropagation()}>
            {newKeyResult ? (
              <div>
                <h2 className="text-lg font-semibold text-slate-800 dark:text-slate-100 mb-4">密钥创建成功</h2>
                <div className="bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 rounded-lg p-3 mb-4">
                  <p className="text-xs text-amber-700 dark:text-amber-400">{newKeyResult.message}</p>
                </div>
                <div className="space-y-3 mb-4">
                  <div>
                    <label className="block text-xs text-slate-500 mb-1">AppKey</label>
                    <div className="flex items-center gap-2">
                      <code className="flex-1 px-3 py-2 bg-slate-50 dark:bg-slate-700 rounded-lg text-sm font-mono text-slate-800 dark:text-slate-200 break-all">
                        {newKeyResult.appKey}
                      </code>
                      <button onClick={() => copyToClipboard(newKeyResult.appKey)} className="p-2 rounded-md hover:bg-slate-100 dark:hover:bg-slate-700">
                        {copied ? <Check className="w-4 h-4 text-green-500" /> : <Copy className="w-4 h-4 text-slate-400" />}
                      </button>
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs text-slate-500 mb-1">AppSecret</label>
                    <div className="flex items-center gap-2">
                      <code className="flex-1 px-3 py-2 bg-slate-50 dark:bg-slate-700 rounded-lg text-sm font-mono text-slate-800 dark:text-slate-200 break-all">
                        {newKeyResult.appSecret}
                      </code>
                      <button onClick={() => copyToClipboard(newKeyResult.appSecret)} className="p-2 rounded-md hover:bg-slate-100 dark:hover:bg-slate-700">
                        {copied ? <Check className="w-4 h-4 text-green-500" /> : <Copy className="w-4 h-4 text-slate-400" />}
                      </button>
                    </div>
                  </div>
                </div>
                <button
                  onClick={() => setShowModal(false)}
                  className="w-full py-2 rounded-lg bg-slate-800 dark:bg-slate-200 text-white dark:text-slate-900 text-sm font-medium"
                >
                  关闭
                </button>
              </div>
            ) : (
              <>
                <h2 className="text-lg font-semibold text-slate-800 dark:text-slate-100 mb-4">新建 API 密钥</h2>
                <form onSubmit={handleSubmit} className="space-y-3">
                  <div>
                    <label className="block text-sm text-slate-600 dark:text-slate-400 mb-1">名称</label>
                    <input
                      type="text"
                      value={form.name}
                      onChange={(e) => setForm({ ...form, name: e.target.value })}
                      className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-700 text-sm focus:outline-none focus:ring-2 focus:ring-slate-400"
                      placeholder="例如：博客自动发布"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-slate-600 dark:text-slate-400 mb-1">所属用户</label>
                    <select
                      value={form.userId}
                      onChange={(e) => setForm({ ...form, userId: e.target.value })}
                      className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-700 text-sm focus:outline-none focus:ring-2 focus:ring-slate-400"
                      required
                    >
                      <option value="">选择用户</option>
                      {users.map((u) => (
                        <option key={u.id} value={u.id}>{u.displayName} ({u.username})</option>
                      ))}
                    </select>
                  </div>
                  <div className="flex justify-end gap-2 pt-2">
                    <button type="button" onClick={() => setShowModal(false)} className="px-4 py-2 text-sm text-slate-600 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg">
                      取消
                    </button>
                    <button type="submit" className="px-4 py-2 text-sm bg-slate-800 dark:bg-slate-200 text-white dark:text-slate-900 rounded-lg hover:bg-slate-700 dark:hover:bg-slate-300">
                      创建
                    </button>
                  </div>
                </form>
              </>
            )}
          </div>
        </div>
      )}

      {/* Keys table */}
      {loading ? (
        <div className="flex justify-center py-12">
          <div className="w-6 h-6 border-2 border-slate-300 border-t-slate-600 rounded-full animate-spin" />
        </div>
      ) : apiKeys.length === 0 ? (
        <div className="text-center py-12 text-slate-400 dark:text-slate-500">
          还没有 API 密钥
        </div>
      ) : (
        <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50">
                <th className="text-left px-4 py-3 font-medium text-slate-600 dark:text-slate-400">名称</th>
                <th className="text-left px-4 py-3 font-medium text-slate-600 dark:text-slate-400">AppKey</th>
                <th className="text-left px-4 py-3 font-medium text-slate-600 dark:text-slate-400">用户</th>
                <th className="text-left px-4 py-3 font-medium text-slate-600 dark:text-slate-400">状态</th>
                <th className="text-right px-4 py-3 font-medium text-slate-600 dark:text-slate-400">操作</th>
              </tr>
            </thead>
            <tbody>
              {apiKeys.map((key) => (
                <tr key={key.id} className="border-b border-slate-100 dark:border-slate-700/50 last:border-0">
                  <td className="px-4 py-3 font-medium text-slate-800 dark:text-slate-200">{key.name}</td>
                  <td className="px-4 py-3">
                    <code className="text-xs font-mono text-slate-500 dark:text-slate-400">{key.appKey}</code>
                  </td>
                  <td className="px-4 py-3 text-slate-600 dark:text-slate-400">{key.user.displayName}</td>
                  <td className="px-4 py-3">
                    <span className={`inline-flex px-2 py-0.5 rounded-full text-xs font-medium ${
                      key.isActive
                        ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300'
                        : 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300'
                    }`}>
                      {key.isActive ? '启用' : '禁用'}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <button onClick={() => deleteKey(key.id)} className="p-1.5 rounded-md hover:bg-red-50 dark:hover:bg-red-950/30 text-slate-400 hover:text-red-500">
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
