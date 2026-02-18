import type { State, ChunkSummary } from '../../state'
import { openai, getContent } from '../../lib/openai'
import { SYSTEM_PROMPT } from './prompt'

const MODEL = 'gpt-5.1'
const TEMPERATURE = 0

export const summarizeChunk = async (state: State): Promise<Partial<State>> => {
  const pages = state.item!
  const { item_index } = state

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

  const summary = getContent(response)

  const chunk_summary: ChunkSummary = {
    chunk_index: item_index,
    summary,
  }

  return { chunk_summaries: [chunk_summary] }
}
