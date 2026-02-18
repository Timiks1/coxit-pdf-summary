import { fromPath } from 'pdf2pic'
import fs from 'fs'
import type { State, PageImage } from '../state'

const DENSITY = 150
const FORMAT = 'png'

export const parsePdf = async (state: State): Promise<Partial<State>> => {
  const { file_path } = state

  const convert = fromPath(file_path, {
    density: DENSITY,
    format: FORMAT,
    width: 1700,
    height: 2200,
  })

  const result = await convert.bulk(-1, { responseType: 'base64' })

  const pages: PageImage[] = result.map((page, index) => ({
    page_number: index + 1,
    base64: page.base64 as string,
  }))

  return {
    pages,
    page_count: pages.length,
  }
}
