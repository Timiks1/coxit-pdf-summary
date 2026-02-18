import OpenAI from 'openai'
import type { State } from '../../state'
import { SYSTEM_PROMPT } from './prompt'

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY })

const MODEL = 'gpt-5.1'
const TEMPERATURE = 0.3

export const mergeSummaries = async (state: State): Promise<Partial<State>> => {
  const { chunk_summaries, file_name } = state

  const sorted = [...chunk_summaries].sort((a, b) => a.chunk_index - b.chunk_index)

  const combined = sorted
    .map(({ chunk_index, summary }) => `## Part ${chunk_index + 1}\n${summary}`)
    .join('\n\n')

  const response = await openai.chat.completions.create({
    model: MODEL,
    temperature: TEMPERATURE,
    messages: [
      { role: 'system', content: SYSTEM_PROMPT },
      {
        role: 'user',
        content: `Document: ${file_name}\n\n${combined}`,
      },
    ],
  })

  const final_summary = response.choices[0]?.message?.content ?? ''

  return { final_summary }
}
