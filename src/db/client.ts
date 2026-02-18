import Database from 'better-sqlite3'
import { mkdirSync } from 'fs'
import path from 'path'

const data_dir = path.join(process.cwd(), 'data')
mkdirSync(data_dir, { recursive: true })

const db_path = path.join(data_dir, 'history.db')

export const db = new Database(db_path)

db.exec(`
  CREATE TABLE IF NOT EXISTS documents (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    file_name TEXT NOT NULL,
    summary TEXT NOT NULL,
    page_count INTEGER NOT NULL,
    created_at TEXT NOT NULL DEFAULT (datetime('now'))
  )
`)
