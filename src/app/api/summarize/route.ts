import { NextResponse } from 'next/server'
import { GoogleGenAI } from '@google/genai'

export const runtime = 'nodejs'

const MAX_CONTENT_LENGTH = 10_000

const PROMPT_PREFIX = [
  '다음 메모를 한국어 2~3문장으로 간결하게 요약하세요.',
  '핵심 내용과 액션 아이템 위주로 작성하고, 마크다운 문법은 사용하지 마세요.',
  '---',
].join('\n')

export async function POST(req: Request) {
  const apiKey = process.env.GEMINI_API_KEY
  if (!apiKey) {
    return NextResponse.json(
      { error: 'GEMINI_API_KEY가 설정되지 않았습니다.' },
      { status: 500 },
    )
  }

  let content: unknown
  try {
    ;({ content } = await req.json())
  } catch {
    return NextResponse.json({ error: '잘못된 요청 형식입니다.' }, { status: 400 })
  }

  if (typeof content !== 'string' || !content.trim()) {
    return NextResponse.json(
      { error: '메모 본문이 비어 있습니다.' },
      { status: 400 },
    )
  }
  if (content.length > MAX_CONTENT_LENGTH) {
    return NextResponse.json(
      { error: '메모가 너무 깁니다. (최대 10,000자)' },
      { status: 413 },
    )
  }

  try {
    const ai = new GoogleGenAI({ apiKey })
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash-lite',
      contents: `${PROMPT_PREFIX}\n${content}`,
    })

    const summary = response.text?.trim() ?? ''
    if (!summary) {
      return NextResponse.json({ error: '요약 생성에 실패했습니다.' }, { status: 502 })
    }

    return NextResponse.json({ summary })
  } catch (err) {
    const message = err instanceof Error ? err.message : '알 수 없는 오류'
    return NextResponse.json(
      { error: `Gemini API 오류: ${message}` },
      { status: 502 },
    )
  }
}
