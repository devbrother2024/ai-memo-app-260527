'use client'

import { useState, useEffect, useCallback, useMemo } from 'react'
import { Memo, MemoFormData } from '@/types/memo'
import { memoRepository } from '@/utils/memoRepository'
import { ensureAnonymousSession } from '@/lib/auth'
import { seedSampleData } from '@/utils/seedData'

export const useMemos = () => {
  const [memos, setMemos] = useState<Memo[]>([])
  const [loading, setLoading] = useState(true)
  const [userId, setUserId] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('all')

  // 초기 로드: 익명 세션 보장 후 메모 목록 조회
  useEffect(() => {
    let cancelled = false
    const init = async () => {
      setLoading(true)
      try {
        const uid = await ensureAnonymousSession()
        if (cancelled) return
        setUserId(uid)
        if (uid) await seedSampleData(uid)
        const loaded = uid ? await memoRepository.list(uid) : []
        if (cancelled) return
        setMemos(loaded)
      } catch (error) {
        console.error('Failed to load memos:', error)
      } finally {
        if (!cancelled) setLoading(false)
      }
    }
    init()
    return () => {
      cancelled = true
    }
  }, [])

  // 메모 생성
  const createMemo = useCallback(
    async (formData: MemoFormData): Promise<Memo> => {
      if (!userId) throw new Error('사용자 세션이 없습니다.')
      const newMemo = await memoRepository.create(userId, formData)
      setMemos(prev => [newMemo, ...prev])
      return newMemo
    },
    [userId],
  )

  // 메모 수정 (본문 변경 시 요약 자동 초기화는 repository에서 처리)
  const updateMemo = useCallback(
    async (id: string, formData: MemoFormData): Promise<void> => {
      const updated = await memoRepository.update(id, formData)
      setMemos(prev => prev.map(m => (m.id === id ? updated : m)))
    },
    [],
  )

  // 메모 삭제
  const deleteMemo = useCallback(async (id: string): Promise<void> => {
    await memoRepository.remove(id)
    setMemos(prev => prev.filter(m => m.id !== id))
  }, [])

  // 특정 메모 가져오기 (in-memory)
  const getMemoById = useCallback(
    (id: string): Memo | undefined => memos.find(m => m.id === id),
    [memos],
  )

  // 검색
  const searchMemos = useCallback((query: string): void => {
    setSearchQuery(query)
  }, [])

  // 카테고리 필터
  const filterByCategory = useCallback((category: string): void => {
    setSelectedCategory(category)
  }, [])

  // 전체 삭제
  const clearAllMemos = useCallback(async (): Promise<void> => {
    if (!userId) return
    await memoRepository.clear(userId)
    setMemos([])
    setSearchQuery('')
    setSelectedCategory('all')
  }, [userId])

  // 요약 결과 로컬 state 반영 (useSummary에서 호출)
  const syncMemoSummary = useCallback(
    (id: string, summary: string | undefined, contentHash: number | undefined) => {
      setMemos(prev =>
        prev.map(m =>
          m.id === id
            ? {
                ...m,
                summary,
                summaryContentHash: contentHash,
                summaryCreatedAt: summary ? new Date().toISOString() : undefined,
              }
            : m,
        ),
      )
    },
    [],
  )

  // 클라이언트 사이드 검색/필터
  const filteredMemos = useMemo(() => {
    let filtered = memos

    if (selectedCategory !== 'all') {
      filtered = filtered.filter(m => m.category === selectedCategory)
    }

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase()
      filtered = filtered.filter(
        m =>
          m.title.toLowerCase().includes(q) ||
          m.content.toLowerCase().includes(q) ||
          m.tags.some(t => t.toLowerCase().includes(q)),
      )
    }

    return filtered
  }, [memos, selectedCategory, searchQuery])

  // 통계
  const stats = useMemo(() => {
    const categoryCounts = memos.reduce(
      (acc, m) => {
        acc[m.category] = (acc[m.category] || 0) + 1
        return acc
      },
      {} as Record<string, number>,
    )
    return {
      total: memos.length,
      byCategory: categoryCounts,
      filtered: filteredMemos.length,
    }
  }, [memos, filteredMemos])

  return {
    memos: filteredMemos,
    allMemos: memos,
    loading,
    searchQuery,
    selectedCategory,
    stats,
    createMemo,
    updateMemo,
    deleteMemo,
    getMemoById,
    searchMemos,
    filterByCategory,
    clearAllMemos,
    syncMemoSummary,
  }
}
