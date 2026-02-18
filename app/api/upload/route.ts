import { NextRequest, NextResponse } from 'next/server'
import { writeFile, mkdir } from 'fs/promises'
import { existsSync } from 'fs'
import path from 'path'
import { v4 as uuid } from 'uuid'
import { runPipeline } from '@/src/pipeline'
import { saveDocument } from '@/src/db/documents'

const UPLOADS_DIR = path.join(process.cwd(), 'uploads')
const MAX_FILE_SIZE = 50 * 1024 * 1024

export const POST = async (req: NextRequest) => {
  const form_data = await req.formData()
  const file = form_data.get('file') as File

  if (file.size > MAX_FILE_SIZE) {
    return NextResponse.json({ error: 'File too large. Maximum size is 50MB.' }, { status: 400 })
  }

  if (!existsSync(UPLOADS_DIR)) {
    await mkdir(UPLOADS_DIR, { recursive: true })
  }

  const file_name = file.name
  const file_id = uuid()
  const file_path = path.join(UPLOADS_DIR, `${file_id}.pdf`)

  const buffer = Buffer.from(await file.arrayBuffer())
  await writeFile(file_path, buffer)

  const { final_summary, page_count } = await runPipeline({ file_path, file_name })

  saveDocument({ file_name, summary: final_summary, page_count })

  return NextResponse.json({ summary: final_summary, file_name, page_count })
}
