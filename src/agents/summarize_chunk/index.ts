import OpenAI from 'openai'
import type { State, ChunkSummary } from '../../state'
import { SYSTEM_PROMPT } from './prompt'

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY })

const MODEL = 'gpt-5.1'
const TEMPERATURE = 0

export const summarizeChunk = async (state: State): Promise<Partial<State>> => {
  const { item, item_index } = state

  const pages = item ?? []

  const image_content = pages.map(page => ({
    type: 'image_url' as const,
    image_url: {
      url: `data:image/png;base64,${page.base64}`,
      detail: 'high' as const,
    },
  }))

  const response = await openai.chat.completions.create({
    model: MODEL,
    temperature: TEMPERATURE,
    messages: [
      { role: 'system', content: SYSTEM_PROMPT },
      {
        role: 'user',
        content: [
          {
            type: 'text',
            text: `Pages ${pages[0]?.page_number}–${pages[pages.length - 1]?.page_number}:`,
          },
          ...image_content,
        ],
      },
    ],
  })

  const summary = response.choices[0]?.message?.content ?? ''

  const chunk_summary: ChunkSummary = {
    chunk_index: item_index,
    summary,
  }

  return { chunk_summaries: [chunk_summary] }
}
