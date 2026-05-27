'use client'

import { useState, useEffect, useCallback } from 'react'
import {
  Memo,
  MemoFormData,
  MEMO_CATEGORIES,
  DEFAULT_CATEGORIES,
} from '@/types/memo'
import MarkdownContent from '@/components/MarkdownContent'

interface MemoFormProps {
  isOpen: boolean
  onClose: () => void
  onSubmit: (data: MemoFormData) => void
  editingMemo?: Memo | null
  saving?: boolean
}

type ViewMode = 'edit' | 'split' | 'preview'

export default function MemoForm({
  isOpen,
  onClose,
  onSubmit,
  editingMemo,
  saving = false,
}: MemoFormProps) {
  const [formData, setFormData] = useState<MemoFormData>({
    title: '',
    content: '',
    category: 'personal',
    tags: [],
  })
  const [tagInput, setTagInput] = useState('')
  const [viewMode, setViewMode] = useState<ViewMode>('split')

  useEffect(() => {
    if (editingMemo) {
      setFormData({
        title: editingMemo.title,
        content: editingMemo.content,
        category: editingMemo.category,
        tags: editingMemo.tags,
      })
    } else {
      setFormData({
        title: '',
        content: '',
        category: 'personal',
        tags: [],
      })
    }
    setTagInput('')
  }, [editingMemo, isOpen])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!formData.title.trim() || !formData.content.trim()) {
      alert('제목과 내용을 모두 입력해주세요.')
      return
    }
    onSubmit(formData)
    onClose()
  }

  const handleAddTag = useCallback(() => {
    const tag = tagInput.trim()
    if (tag && !formData.tags.includes(tag)) {
      setFormData(prev => ({ ...prev, tags: [...prev.tags, tag] }))
      setTagInput('')
    }
  }, [tagInput, formData.tags])

  const handleRemoveTag = useCallback(
    (tagToRemove: string) => {
      setFormData(prev => ({
        ...prev,
        tags: prev.tags.filter(tag => tag !== tagToRemove),
      }))
    },
    [],
  )

  const handleTagInputKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault()
      handleAddTag()
    }
  }

  if (!isOpen) return null

  const isSplit = viewMode === 'split'
  const showEditor = viewMode === 'edit' || isSplit
  const showPreview = viewMode === 'preview' || isSplit

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div
        className={`bg-white rounded-lg shadow-xl w-full max-h-[90vh] flex flex-col transition-all duration-200 ${
          isSplit ? 'max-w-5xl' : 'max-w-2xl'
        }`}
      >
        <div className="p-6 pb-0 flex-shrink-0">
          {/* 헤더 */}
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold text-gray-900">
              {editingMemo ? '메모 편집' : '새 메모 작성'}
            </h2>
            <button
              onClick={onClose}
              className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
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
        </div>

        <form
          onSubmit={handleSubmit}
          className="flex flex-col flex-1 min-h-0 overflow-hidden"
        >
          {/* 제목·카테고리 영역 */}
          <div className="px-6 space-y-4 flex-shrink-0">
            {/* 제목 */}
            <div>
              <label
                htmlFor="title"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                제목 *
              </label>
              <input
                type="text"
                id="title"
                value={formData.title}
                onChange={e =>
                  setFormData(prev => ({ ...prev, title: e.target.value }))
                }
                className="placeholder-gray-400 text-gray-700 w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                placeholder="메모 제목을 입력하세요"
                required
              />
            </div>

            {/* 카테고리 */}
            <div>
              <label
                htmlFor="category"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                카테고리
              </label>
              <select
                id="category"
                value={formData.category}
                onChange={e =>
                  setFormData(prev => ({ ...prev, category: e.target.value }))
                }
                className="text-gray-700 w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
              >
                {DEFAULT_CATEGORIES.map(category => (
                  <option key={category} value={category}>
                    {MEMO_CATEGORIES[category]}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* 내용 영역: 뷰 모드 탭 + 에디터/프리뷰 */}
          <div className="flex flex-col flex-1 min-h-0 mt-4 px-6">
            {/* 탭 툴바 */}
            <div className="flex items-center justify-between mb-2">
              <label className="text-sm font-medium text-gray-700">
                내용 *
              </label>
              <div className="flex rounded-lg border border-gray-200 overflow-hidden text-xs">
                {(
                  [
                    { id: 'edit', label: '편집' },
                    { id: 'split', label: '분할' },
                    { id: 'preview', label: '미리보기' },
                  ] as { id: ViewMode; label: string }[]
                ).map(({ id, label }) => (
                  <button
                    key={id}
                    type="button"
                    onClick={() => setViewMode(id)}
                    className={`px-3 py-1.5 transition-colors ${
                      viewMode === id
                        ? 'bg-blue-600 text-white'
                        : 'text-gray-500 hover:bg-gray-50'
                    }`}
                  >
                    {label}
                  </button>
                ))}
              </div>
            </div>

            {/* 에디터 / 분할 / 미리보기 */}
            <div
              className={`flex flex-1 min-h-0 gap-3 ${isSplit ? 'flex-row' : 'flex-col'}`}
            >
              {showEditor && (
                <div className={isSplit ? 'flex-1 min-w-0' : 'w-full'}>
                  <textarea
                    id="content"
                    value={formData.content}
                    onChange={e =>
                      setFormData(prev => ({
                        ...prev,
                        content: e.target.value,
                      }))
                    }
                    className="placeholder-gray-400 text-gray-700 w-full h-full min-h-[240px] px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors resize-none font-mono text-sm"
                    placeholder="메모 내용을 입력하세요 (마크다운 지원)"
                    required={viewMode !== ('preview' as string)}
                  />
                </div>
              )}

              {showPreview && (
                <div
                  className={`${isSplit ? 'flex-1 min-w-0' : 'w-full'} border border-gray-200 rounded-lg px-3 py-2 overflow-y-auto min-h-[240px] bg-gray-50`}
                >
                  {formData.content.trim() ? (
                    <MarkdownContent content={formData.content} />
                  ) : (
                    <p className="text-gray-400 text-sm italic">
                      내용을 입력하면 마크다운 미리보기가 표시됩니다.
                    </p>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* 태그 + 버튼 */}
          <div className="px-6 pt-4 pb-6 space-y-4 flex-shrink-0">
            {/* 태그 */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                태그
              </label>
              <div className="flex gap-2 mb-2">
                <input
                  type="text"
                  value={tagInput}
                  onChange={e => setTagInput(e.target.value)}
                  onKeyDown={handleTagInputKeyDown}
                  className="placeholder-gray-400 text-black flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                  placeholder="태그를 입력하고 Enter를 누르세요"
                />
                <button
                  type="button"
                  onClick={handleAddTag}
                  className="px-4 py-2 bg-gray-100 text-gray-700 hover:bg-gray-200 rounded-lg transition-colors"
                >
                  추가
                </button>
              </div>

              {formData.tags.length > 0 && (
                <div className="flex gap-2 flex-wrap">
                  {formData.tags.map((tag, index) => (
                    <span
                      key={index}
                      className="inline-flex items-center gap-1 px-3 py-1 bg-blue-100 text-blue-800 text-sm rounded-full"
                    >
                      #{tag}
                      <button
                        type="button"
                        onClick={() => handleRemoveTag(tag)}
                        className="text-blue-600 hover:text-blue-800"
                        aria-label={`${tag} 태그 삭제`}
                      >
                        <svg
                          className="w-3 h-3"
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
                    </span>
                  ))}
                </div>
              )}
            </div>

            {/* 버튼 */}
            <div className="flex gap-3">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 hover:bg-gray-50 rounded-lg transition-colors"
              >
                취소
              </button>
              <button
                type="submit"
                disabled={saving}
                className="flex-1 px-4 py-2 bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-60 disabled:cursor-not-allowed rounded-lg transition-colors"
              >
                {saving ? '저장 중...' : editingMemo ? '수정하기' : '저장하기'}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  )
}
