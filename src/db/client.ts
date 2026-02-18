import Database from 'better-sqlite3'
import path from 'path'

const db_path = path.join(process.cwd(), 'data', 'history.db')

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
