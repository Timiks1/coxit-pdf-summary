import { db } from './client'

interface Document {
  id: number
  file_name: string
  summary: string
  page_count: number
  created_at: string
}

interface SaveDocumentParams {
  file_name: string
  summary: string
  page_count: number
}

export const saveDocument = ({ file_name, summary, page_count }: SaveDocumentParams) => {
  const stmt = db.prepare(
    'INSERT INTO documents (file_name, summary, page_count) VALUES (?, ?, ?)'
  )

  return stmt.run(file_name, summary, page_count)
}

export const getHistory = (): Document[] => {
  const stmt = db.prepare(
    'SELECT * FROM documents ORDER BY created_at DESC LIMIT 5'
  )

  return stmt.all() as Document[]
}
