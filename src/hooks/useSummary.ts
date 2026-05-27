'use client'

import { useState, useEffect, useCallback } from 'react'
import { Memo } from '@/types/memo'
import { memoRepository } from '@/utils/memoRepository'
import { djb2 } from '@/utils/contentHash'

interface SummarizeOptions {
  force?: boolean
}

interface UseSummaryReturn {
  summary: string | null
  loading: boolean
  error: string | null
  summarize: (memo: Memo, opts?: SummarizeOptions) => Promise<void>
  clear: (memoId: string) => void
}

export function useSummary(
  memo: Memo | null,
  onSummaryChange?: (id: string, summary: string | undefined, contentHash: number | undefined) => void,
): UseSummaryReturn {
  const [summary, setSummary] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // 메모 변경 시 DB에 저장된 요약을 즉시 표시 (본문 hash 검증)
  useEffect(() => {
    if (!memo) {
      setSummary(null)
      setError(null)
      return
    }

    if (
      memo.summary &&
      memo.summaryContentHash != null &&
      memo.summaryContentHash === djb2(memo.content)
    ) {
      setSummary(memo.summary)
    } else {
      setSummary(null)
    }
    setError(null)
  }, [memo])

  const summarize = useCallback(
    async (target: Memo, opts: SummarizeOptions = {}) => {
      // 캐시 유효성 확인
      if (
        !opts.force &&
        target.summary &&
        target.summaryContentHash != null &&
        target.summaryContentHash === djb2(target.content)
      ) {
        setSummary(target.summary)
        return
      }

      setLoading(true)
      setError(null)

      try {
        const res = await fetch('/api/summarize', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ content: target.content }),
        })

        const data = (await res.json()) as { summary?: string; error?: string }

        if (!res.ok || !data.summary) {
          throw new Error(data.error ?? '요약에 실패했습니다.')
        }

        await memoRepository.saveSummary(target.id, target.content, data.summary)
        setSummary(data.summary)
        onSummaryChange?.(target.id, data.summary, djb2(target.content))
      } catch (err) {
        const message = err instanceof Error ? err.message : '알 수 없는 오류'
        setError(message)
      } finally {
        setLoading(false)
      }
    },
    [onSummaryChange],
  )

  const clear = useCallback(
    (memoId: string) => {
      memoRepository.clearSummary(memoId).catch(err => console.error('요약 삭제 실패:', err))
      setSummary(null)
      setError(null)
      onSummaryChange?.(memoId, undefined, undefined)
    },
    [onSummaryChange],
  )

  return { summary, loading, error, summarize, clear }
}
