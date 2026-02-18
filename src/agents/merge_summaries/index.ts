import type { State } from '../../state'
import { openai, getContent } from '../../lib/openai'
import { SYSTEM_PROMPT } from './prompt'

const MODEL = 'gpt-5.1'
const TEMPERATURE = 0

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

  const final_summary = getContent(response)

  return { final_summary }
}
