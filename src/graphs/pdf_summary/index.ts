import { StateGraph, END, START, Send } from '@langchain/langgraph'
import { StateAnnotation } from '../../state'
import type { State } from '../../state'
import { parsePdf } from '../../nodes/parse_pdf'
import { chunkPages } from '../../nodes/chunk_pages'
import { summarizeChunk } from '../../agents/summarize_chunk'
import { mergeSummaries } from '../../agents/merge_summaries'

const sendChunksToSummarize = (state: State) => {
  return state.chunks.map((chunk, index) =>
    new Send('summarize_chunk', { ...state, item: chunk, item_index: index })
  )
}

export const pdfSummaryGraph = new StateGraph(StateAnnotation)
  .addNode('parse_pdf', parsePdf)
  .addNode('chunk_pages', chunkPages)
  .addNode('summarize_chunk', summarizeChunk)
  .addNode('merge_summaries', mergeSummaries)
  .addEdge(START, 'parse_pdf')
  .addEdge('parse_pdf', 'chunk_pages')
  .addConditionalEdges('chunk_pages', sendChunksToSummarize)
  .addEdge('summarize_chunk', 'merge_summaries')
  .addEdge('merge_summaries', END)
  .compile()
