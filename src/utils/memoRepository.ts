import { supabase } from '@/lib/supabase'
import { Memo, MemoFormData } from '@/types/memo'
import { djb2 } from '@/utils/contentHash'

interface DbMemo {
  id: string
  user_id: string
  title: string
  content: string
  category: string
  tags: string[]
  summary: string | null
  summary_content_hash: number | null
  summary_created_at: string | null
  created_at: string
  updated_at: string
}

function toMemo(row: DbMemo): Memo {
  return {
    id: row.id,
    title: row.title,
    content: row.content,
    category: row.category,
    tags: row.tags,
    summary: row.summary ?? undefined,
    summaryContentHash: row.summary_content_hash ?? undefined,
    summaryCreatedAt: row.summary_created_at ?? undefined,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  }
}

export const memoRepository = {
  async list(userId: string): Promise<Memo[]> {
    const { data, error } = await supabase
      .from('memos')
      .select('*')
      .eq('user_id', userId)
      .order('updated_at', { ascending: false })

    if (error) throw error
    return (data as DbMemo[]).map(toMemo)
  },

  async create(userId: string, formData: MemoFormData): Promise<Memo> {
    const { data, error } = await supabase
      .from('memos')
      .insert({
        user_id: userId,
        title: formData.title,
        content: formData.content,
        category: formData.category,
        tags: formData.tags,
      })
      .select('*')
      .single()

    if (error) throw error
    return toMemo(data as DbMemo)
  },

  async update(id: string, formData: MemoFormData): Promise<Memo> {
    const { data, error } = await supabase
      .from('memos')
      .update({
        title: formData.title,
        content: formData.content,
        category: formData.category,
        tags: formData.tags,
        summary: null,
        summary_content_hash: null,
        summary_created_at: null,
      })
      .eq('id', id)
      .select('*')
      .single()

    if (error) throw error
    return toMemo(data as DbMemo)
  },

  async remove(id: string): Promise<void> {
    const { error } = await supabase.from('memos').delete().eq('id', id)
    if (error) throw error
  },

  async clear(userId: string): Promise<void> {
    const { error } = await supabase.from('memos').delete().eq('user_id', userId)
    if (error) throw error
  },

  async saveSummary(id: string, content: string, summary: string): Promise<void> {
    const { error } = await supabase
      .from('memos')
      .update({
        summary,
        summary_content_hash: djb2(content),
        summary_created_at: new Date().toISOString(),
      })
      .eq('id', id)

    if (error) throw error
  },

  async clearSummary(id: string): Promise<void> {
    const { error } = await supabase
      .from('memos')
      .update({
        summary: null,
        summary_content_hash: null,
        summary_created_at: null,
      })
      .eq('id', id)

    if (error) throw error
  },
}
