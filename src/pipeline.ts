import { pdfSummaryGraph } from './graphs/pdf_summary'

interface RunPipelineParams {
  file_path: string
  file_name: string
}

export const runPipeline = async ({ file_path, file_name }: RunPipelineParams) => {
  const result = await pdfSummaryGraph.invoke({ file_path, file_name })

  return {
    final_summary: result.final_summary as string,
    page_count: result.page_count as number,
  }
}
