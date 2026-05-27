# Utils - AI Agent 지침서

## 모듈 역할

순수 유틸리티 함수 및 헬퍼 집합. 비즈니스 로직과 독립적인 재사용 가능한 기능을 제공한다.

## 의존성 관계

- `@/types/memo` — Memo 타입

## 유틸리티 목록

| 파일 | 역할 |
|------|------|
| `memoRepository.ts` | Supabase CRUD 어댑터 |
| `contentHash.ts` | 요약 본문 변경 감지용 djb2 해시 |

## memoRepository 구조

```typescript
const memoRepository = {
  list(): Promise<Memo[]>                              // 전체 메모 조회 (updated_at 내림차순)
  create(userId, formData): Promise<Memo>             // 메모 생성
  update(id, formData): Promise<Memo>                 // 메모 수정 (요약 자동 초기화)
  remove(id): Promise<void>                           // 메모 삭제
  clear(userId): Promise<void>                        // 사용자의 전체 메모 삭제
  saveSummary(id, content, summary): Promise<void>    // 요약 저장
  clearSummary(id): Promise<void>                     // 요약 초기화
}
```

## Implementation Patterns

### 새 유틸리티 파일 작성 템플릿

```typescript
// 타입 import
import { SomeType } from '@/types/someType'

// 상수 정의
const STORAGE_KEY = 'app-key'

// 객체 형태로 관련 함수 그룹화
export const utilName = {
  method1: (param: ParamType): ReturnType => {
    // 구현
  },

  method2: (param: ParamType): ReturnType => {
    // 구현
  },
}
```

## Local Golden Rules

### Do's

- `memoRepository` 함수는 모두 async/await으로 작성
- 에러는 throw하여 호출측 훅(useMemos)에서 처리
- 에러 발생 시 console.error 로깅 후 재throw

### Don'ts

- React 훅 사용 금지 (유틸리티는 훅이 아님)
- 전역 상태 변경 금지
- 직접 DOM 조작 금지 (React에 위임)
- 비동기 함수에서 에러 무시 금지

## Supabase 테이블

현재 사용 중인 테이블:
- `public.memos` — 메모 데이터 + 요약 컬럼 (RLS 활성화)

## 테스트 고려사항

- `memoRepository` 함수 테스트 시 Supabase client를 모킹 필요
- E2E 테스트는 별도 Supabase test 프로젝트 또는 로컬 Supabase 환경 권장
