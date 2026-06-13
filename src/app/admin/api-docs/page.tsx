'use client'

import { Copy, Check } from 'lucide-react'
import { useState, useEffect } from 'react'

function useBaseUrl() {
  const [origin, setOrigin] = useState('https://your-domain.com')
  useEffect(() => {
    setOrigin(window.location.origin)
  }, [])
  return origin
}

export default function ApiDocsPage() {
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null)
  const origin = useBaseUrl()

  const codeBlocks = [
    {
      title: '发布微语',
      method: 'POST' as const,
      url: '/api/qnotes',
      description: '通过 API 密钥认证，发布一条微语。',
      code: `curl -X POST ${origin}/api/qnotes \\
  -H "Content-Type: application/json" \\
  -H "X-APP-KEY: qk_your_app_key" \\
  -H "X-APP-SECRET: qs_your_app_secret" \\
  -d '{"content": "你好，世界！"}'`,
      response: `{
  "qnote": {
    "id": 1,
    "content": "你好，世界！",
    "shareId": "xxx-xxx-xxx",
    "isPublic": true,
    "createdAt": "2024-01-01T00:00:00.000Z",
    "user": {
      "displayName": "管理员",
      "username": "admin"
    }
  }
}`,
    },
    {
      title: '获取微语列表',
      method: 'GET' as const,
      url: '/api/qnotes',
      description: '获取公开微语列表，支持分页。',
      code: `curl ${origin}/api/qnotes?page=1&pageSize=20`,
      response: `{
  "qnotes": [
    {
      "id": 1,
      "content": "你好，世界！",
      "shareId": "xxx-xxx-xxx",
      "createdAt": "2024-01-01T00:00:00.000Z",
      "user": {
        "displayName": "管理员",
        "username": "admin"
      }
    }
  ],
  "pagination": {
    "page": 1,
    "pageSize": 20,
    "total": 1,
    "totalPages": 1
  }
}`,
    },
    {
      title: '获取分享数据',
      method: 'GET' as const,
      url: '/api/share/:shareId',
      description: '通过分享 ID 获取单条微语数据。',
      code: `curl ${origin}/api/share/xxx-xxx-xxx`,
      response: `{
  "qnote": {
    "id": 1,
    "content": "你好，世界！",
    "shareId": "xxx-xxx-xxx",
    "createdAt": "2024-01-01T00:00:00.000Z",
    "user": {
      "displayName": "管理员",
      "username": "admin"
    }
  }
}`,
    },
  ]

  function copyCode(index: number, text: string) {
    navigator.clipboard.writeText(text)
    setCopiedIndex(index)
    setTimeout(() => setCopiedIndex(null), 2000)
  }

  return (
    <div className="max-w-4xl mx-auto">
      <h1 className="text-xl font-bold text-slate-800 dark:text-slate-100 mb-2">
        RESTful API 文档
      </h1>
      <p className="text-sm text-slate-500 dark:text-slate-400 mb-8">
        使用 API 密钥认证，通过 HTTP 接口发布和获取微语。
      </p>

      {/* Auth Section */}
      <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-5 mb-6">
        <h2 className="text-base font-semibold text-slate-800 dark:text-slate-100 mb-3">
          认证方式
        </h2>
        <p className="text-sm text-slate-600 dark:text-slate-400 mb-3">
          所有写操作需要通过 API 密钥认证。在管理后台 <strong>API 密钥</strong> 页面创建密钥，
          然后在请求头中传入：
        </p>
        <div className="bg-slate-50 dark:bg-slate-900 rounded-lg p-4 space-y-2 text-sm font-mono text-slate-700 dark:text-slate-300">
          <div><span className="text-slate-400"># 请求头</span></div>
          <div><span className="text-blue-600 dark:text-blue-400">X-APP-KEY</span>: qk_your_app_key</div>
          <div><span className="text-blue-600 dark:text-blue-400">X-APP-SECRET</span>: qs_your_app_secret</div>
        </div>
      </div>

      {/* Endpoints */}
      <div className="space-y-6">
        {codeBlocks.map((block, index) => (
          <div
            key={index}
            className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 overflow-hidden"
          >
            {/* Header */}
            <div className="flex items-center gap-3 px-5 py-3 border-b border-slate-100 dark:border-slate-700">
              <span className={`inline-flex px-2 py-0.5 rounded text-xs font-bold uppercase ${
                block.method === 'POST'
                  ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300'
                  : 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300'
              }`}>
                {block.method}
              </span>
              <code className="text-sm font-mono text-slate-700 dark:text-slate-300">
                {block.url}
              </code>
            </div>

            {/* Body */}
            <div className="p-5">
              <h3 className="text-sm font-medium text-slate-800 dark:text-slate-100 mb-1">
                {block.title}
              </h3>
              <p className="text-sm text-slate-500 dark:text-slate-400 mb-4">
                {block.description}
              </p>

              {/* Code */}
              <div className="relative">
                <pre className="bg-slate-900 dark:bg-slate-950 rounded-lg p-4 overflow-x-auto text-sm font-mono text-slate-200 leading-relaxed">
                  {block.code}
                </pre>
                <button
                  onClick={() => copyCode(index, block.code)}
                  className="absolute top-2 right-2 p-1.5 rounded-md bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-slate-200 transition-colors"
                >
                  {copiedIndex === index ? (
                    <Check className="w-3.5 h-3.5 text-green-400" />
                  ) : (
                    <Copy className="w-3.5 h-3.5" />
                  )}
                </button>
              </div>

              {/* Response */}
              <details className="mt-3">
                <summary className="text-xs text-slate-400 dark:text-slate-500 cursor-pointer hover:text-slate-600 dark:hover:text-slate-400 select-none">
                  查看响应示例
                </summary>
                <pre className="mt-2 bg-slate-50 dark:bg-slate-900 rounded-lg p-4 overflow-x-auto text-sm font-mono text-slate-600 dark:text-slate-400 leading-relaxed">
                  {block.response}
                </pre>
              </details>
            </div>
          </div>
        ))}
      </div>

      {/* Error codes */}
      <div className="mt-8 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-5">
        <h2 className="text-base font-semibold text-slate-800 dark:text-slate-100 mb-3">
          错误码说明
        </h2>
        <div className="text-sm space-y-2">
          <div className="flex items-center gap-3">
            <span className="w-16 px-2 py-0.5 rounded text-xs font-bold bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300 text-center">401</span>
            <span className="text-slate-600 dark:text-slate-400">缺少或无效的 API 密钥</span>
          </div>
          <div className="flex items-center gap-3">
            <span className="w-16 px-2 py-0.5 rounded text-xs font-bold bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300 text-center">400</span>
            <span className="text-slate-600 dark:text-slate-400">请求参数错误（如内容为空）</span>
          </div>
          <div className="flex items-center gap-3">
            <span className="w-16 px-2 py-0.5 rounded text-xs font-bold bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300 text-center">500</span>
            <span className="text-slate-600 dark:text-slate-400">服务器内部错误</span>
          </div>
        </div>
      </div>
    </div>
  )
}
