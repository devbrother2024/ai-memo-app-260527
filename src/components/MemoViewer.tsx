'use client'

import { useEffect, useCallback } from 'react'
import { Memo, MEMO_CATEGORIES } from '@/types/memo'
import MarkdownContent from '@/components/MarkdownContent'
import { useSummary } from '@/hooks/useSummary'

interface MemoViewerProps {
  memo: Memo | null
  onClose: () => void
  onEdit: (memo: Memo) => void
  onDelete: (id: string) => void
  onSummaryChange?: (id: string, summary: string | undefined, contentHash: number | undefined) => void
}

export default function MemoViewer({
  memo,
  onClose,
  onEdit,
  onDelete,
  onSummaryChange,
}: MemoViewerProps) {
  const { summary, loading, error, summarize, clear } = useSummary(memo, onSummaryChange)

  const handleDelete = useCallback(() => {
    if (!memo) return
    if (window.confirm('정말로 이 메모를 삭제하시겠습니까?')) {
      onDelete(memo.id)
      onClose()
    }
  }, [memo, onDelete, onClose])

  const handleEdit = useCallback(() => {
    if (!memo) return
    onEdit(memo)
    onClose()
  }, [memo, onEdit, onClose])

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [onClose])

  useEffect(() => {
    if (memo) {
      document.body.style.overflow = 'hidden'
    }
    return () => {
      document.body.style.overflow = ''
    }
  }, [memo])

  if (!memo) return null

  const formatDate = (dateString: string) =>
    new Date(dateString).toLocaleDateString('ko-KR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })

  const getCategoryColor = (category: string) => {
    const colors: Record<string, string> = {
      personal: 'bg-blue-100 text-blue-800',
      work: 'bg-green-100 text-green-800',
      study: 'bg-purple-100 text-purple-800',
      idea: 'bg-yellow-100 text-yellow-800',
      other: 'bg-gray-100 text-gray-800',
    }
    return colors[category] ?? colors.other
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="viewer-title"
    >
      {/* 배경 오버레이 */}
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* 모달 패널 */}
      <div className="relative z-10 w-full max-w-2xl max-h-[90vh] bg-white rounded-2xl shadow-2xl flex flex-col overflow-hidden">
        {/* 헤더 */}
        <div className="flex items-start justify-between px-6 pt-6 pb-4 border-b border-gray-100">
          <div className="flex-1 min-w-0 pr-4">
            <h2
              id="viewer-title"
              className="text-xl font-bold text-gray-900 break-words"
            >
              {memo.title}
            </h2>
            <div className="flex items-center gap-2 mt-2 flex-wrap">
              <span
                className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${getCategoryColor(memo.category)}`}
              >
                {MEMO_CATEGORIES[memo.category as keyof typeof MEMO_CATEGORIES] ??
                  memo.category}
              </span>
              <span className="text-xs text-gray-400">
                수정: {formatDate(memo.updatedAt)}
              </span>
              {memo.createdAt !== memo.updatedAt && (
                <span className="text-xs text-gray-400">
                  작성: {formatDate(memo.createdAt)}
                </span>
              )}
            </div>
          </div>

          {/* 닫기 버튼 */}
          <button
            onClick={onClose}
            className="flex-shrink-0 p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
            aria-label="닫기"
          >
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>

        {/* 내용 */}
        <div className="flex-1 overflow-y-auto px-6 py-5 space-y-5">
          <MarkdownContent content={memo.content} />

          {/* 태그 */}
          {memo.tags.length > 0 && (
            <div className="flex gap-2 flex-wrap pt-4 border-t border-gray-100">
              {memo.tags.map((tag, index) => (
                <span
                  key={index}
                  className="px-2.5 py-1 bg-gray-100 text-gray-600 text-xs rounded-md"
                >
                  #{tag}
                </span>
              ))}
            </div>
          )}

          {/* AI 요약 패널 */}
          <div className="border-t border-gray-100 pt-4">
            {/* 요약 없음 + 로딩 아님 → 버튼 */}
            {!summary && !loading && !error && (
              <button
                onClick={() => summarize(memo)}
                className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-violet-700 bg-violet-50 border border-violet-200 rounded-lg hover:bg-violet-100 transition-colors"
              >
                <svg
                  className="w-4 h-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M13 10V3L4 14h7v7l9-11h-7z"
                  />
                </svg>
                AI 요약
              </button>
            )}

            {/* 로딩 중 */}
            {loading && (
              <div className="flex items-center gap-2 text-sm text-gray-500">
                <svg
                  className="w-4 h-4 animate-spin"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  />
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8v8H4z"
                  />
                </svg>
                요약 중...
              </div>
            )}

            {/* 에러 */}
            {error && !loading && (
              <div className="flex items-center justify-between gap-3 px-3 py-2 bg-red-50 border border-red-200 rounded-lg text-sm text-red-600">
                <span>{error}</span>
                <button
                  onClick={() => summarize(memo, { force: true })}
                  className="text-xs font-medium underline whitespace-nowrap hover:text-red-800"
                >
                  재시도
                </button>
              </div>
            )}

            {/* 요약 결과 */}
            {summary && !loading && (
              <div className="bg-violet-50 border border-violet-200 rounded-lg px-4 py-3">
                <div className="flex items-center justify-between mb-2">
                  <span className="flex items-center gap-1.5 text-xs font-semibold text-violet-600 uppercase tracking-wide">
                    <svg
                      className="w-3.5 h-3.5"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M13 10V3L4 14h7v7l9-11h-7z"
                      />
                    </svg>
                    AI 요약
                  </span>
                  <div className="flex items-center gap-1">
                    {/* 다시 요약 */}
                    <button
                      onClick={() => summarize(memo, { force: true })}
                      className="p-1 text-violet-400 hover:text-violet-600 hover:bg-violet-100 rounded transition-colors"
                      title="다시 요약"
                      aria-label="다시 요약"
                    >
                      <svg
                        className="w-3.5 h-3.5"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                        />
                      </svg>
                    </button>
                    {/* 요약 지우기 */}
                    <button
                      onClick={() => clear(memo.id)}
                      className="p-1 text-violet-400 hover:text-violet-600 hover:bg-violet-100 rounded transition-colors"
                      title="요약 지우기"
                      aria-label="요약 지우기"
                    >
                      <svg
                        className="w-3.5 h-3.5"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M6 18L18 6M6 6l12 12"
                        />
                      </svg>
                    </button>
                  </div>
                </div>
                <p className="text-sm text-gray-700 leading-relaxed">{summary}</p>
              </div>
            )}
          </div>
        </div>

        {/* 푸터 액션 */}
        <div className="flex justify-end gap-3 px-6 py-4 border-t border-gray-100 bg-gray-50">
          <button
            onClick={handleDelete}
            className="inline-flex items-center gap-1.5 px-4 py-2 text-sm font-medium text-red-600 bg-white border border-red-200 rounded-lg hover:bg-red-50 hover:border-red-300 transition-colors"
          >
            <svg
              className="w-4 h-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
              />
            </svg>
            삭제
          </button>
          <button
            onClick={handleEdit}
            className="inline-flex items-center gap-1.5 px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors"
          >
            <svg
              className="w-4 h-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
              />
            </svg>
            편집
          </button>
        </div>
      </div>
    </div>
  )
}
