'use client'

import { supabase } from '@/lib/supabase'

const DEVICE_ID_KEY = 'memo-app-device-id'

/**
 * Supabase 익명 로그인을 시도하고, 비활성화된 경우 localStorage UUID 기반 폴백 세션을 생성합니다.
 * 반환값: 현재 사용자 id 또는 null
 */
export async function ensureAnonymousSession(): Promise<string | null> {
  // 기존 세션 확인
  const {
    data: { session },
  } = await supabase.auth.getSession()

  if (session?.user) return session.user.id

  // 익명 로그인 시도
  const { data, error } = await supabase.auth.signInAnonymously()

  if (!error && data.user) {
    return data.user.id
  }

  // 익명 로그인 비활성화 시 localStorage 기반 디바이스 ID 폴백
  if (error?.message?.includes('Anonymous sign-ins are disabled')) {
    return getOrCreateDeviceSession()
  }

  console.error('인증 실패:', error)
  return null
}

async function getOrCreateDeviceSession(): Promise<string | null> {
  if (typeof window === 'undefined') return null

  const existing = localStorage.getItem(DEVICE_ID_KEY)
  if (existing) return existing

  // 신규 디바이스 ID 생성
  const { v4: uuidv4 } = await import('uuid')
  const deviceId = uuidv4()
  localStorage.setItem(DEVICE_ID_KEY, deviceId)
  return deviceId
}
