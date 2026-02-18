import { Annotation } from '@langchain/langgraph'

export interface PageImage {
  page_number: number
  base64: string
}

export interface ChunkSummary {
  chunk_index: number
  summary: string
}

export const StateAnnotation = Annotation.Root({
  file_path: Annotation<string>,
  file_name: Annotation<string>,
  page_count: Annotation<number>,

  pages: Annotation<PageImage[]>({
    reducer: (x, y) => y ?? x,
    default: () => [],
  }),

  chunks: Annotation<PageImage[][]>({
    reducer: (x, y) => y ?? x,
    default: () => [],
  }),

  item: Annotation<PageImage[] | null>({
    reducer: (x, y) => y ?? x,
    default: () => null,
  }),

  item_index: Annotation<number>({
    reducer: (x, y) => y ?? x,
    default: () => 0,
  }),

  chunk_summaries: Annotation<ChunkSummary[]>({
    reducer: (x, y) => [...x, ...y],
    default: () => [],
  }),

  final_summary: Annotation<string | null>({
    reducer: (x, y) => y ?? x,
    default: () => null,
  }),
})

export type State = typeof StateAnnotation.State
