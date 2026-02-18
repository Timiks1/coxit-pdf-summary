import type { State } from '../state'

const PAGES_PER_CHUNK = 10

export const chunkPages = (state: State): Partial<State> => {
  const { pages } = state

  const chunks: typeof pages[] = []

  pages.forEach((page, index) => {
    const chunk_index = Math.floor(index / PAGES_PER_CHUNK)

    if (!chunks[chunk_index]) {
      chunks[chunk_index] = []
    }

    chunks[chunk_index].push(page)
  })

  return { chunks }
}
