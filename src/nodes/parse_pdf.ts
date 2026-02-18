import { exec } from 'child_process'
import { promisify } from 'util'
import { mkdir, readdir, readFile, rm } from 'fs/promises'
import path from 'path'
import os from 'os'
import { v4 as uuid } from 'uuid'
import type { State, PageImage } from '../state'

const execAsync = promisify(exec)

export const parsePdf = async (state: State): Promise<Partial<State>> => {
  const { file_path } = state

  const temp_dir = path.join(os.tmpdir(), uuid())
  await mkdir(temp_dir, { recursive: true })

  const output_prefix = path.join(temp_dir, 'page')
  await execAsync(`pdftoppm -png -r 150 "${file_path}" "${output_prefix}"`)

  const files = await readdir(temp_dir)
  const png_files = files.filter(f => f.endsWith('.png')).sort()

  const pages: PageImage[] = await Promise.all(
    png_files.map(async (file, index) => {
      const buffer = await readFile(path.join(temp_dir, file))

      return {
        page_number: index + 1,
        base64: buffer.toString('base64'),
      }
    })
  )

  await rm(temp_dir, { recursive: true })

  return {
    pages,
    page_count: pages.length,
  }
}
