import type { State } from '../state'

const PAGES_PER_CHUNK = 35

export const chunkPages = (state: State): Partial<State> => {
  const { pages } = state

  const chunks = Array.from(
    { length: Math.ceil(pages.length / PAGES_PER_CHUNK) },
    (_, i) => pages.slice(i * PAGES_PER_CHUNK, (i + 1) * PAGES_PER_CHUNK)
  )

  return { chunks }
}
