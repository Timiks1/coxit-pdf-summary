# PDF Summary AI

Upload PDF documents (up to 50MB, 100 pages) and receive AI-generated summaries using GPT-5.1 Vision. Supports PDFs with images, tables, and scanned content.

## How It Works

1. PDF pages are converted to images via `pdf2pic`
2. Pages are grouped into chunks of 10
3. All chunks are summarized in **parallel** using GPT-5.1 Vision (map phase)
4. Chunk summaries are merged into a single cohesive summary (reduce phase)
5. Result is saved to SQLite and displayed in the UI

## Setup

### Prerequisites

- Node.js 20+
- [poppler](https://poppler.freedesktop.org/) (for PDF→image conversion)
  - macOS: `brew install poppler`
  - Ubuntu: `apt-get install poppler-utils`
- OpenAI API key

### Local Development

```bash
# 1. Install dependencies
npm install --legacy-peer-deps

# 2. Configure environment
cp .env.example .env.local
# Add your OPENAI_API_KEY to .env.local

# 3. Run
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

## Docker

```bash
# Copy and fill env file
cp .env.example .env
# edit .env and set OPENAI_API_KEY

# Build and run
docker compose up --build
```

The app runs on [http://localhost:3000](http://localhost:3000).

Data persists across restarts in Docker volumes (`pdf_data` for SQLite, `pdf_uploads` for temp files).

## API

### `POST /api/upload`

Upload a PDF and receive a summary.

**Request:** `multipart/form-data`

| Field | Type | Description |
|-------|------|-------------|
| `file` | File | PDF file, max 50MB |

**Response:**
```json
{
  "summary": "The document covers...",
  "file_name": "report.pdf",
  "page_count": 42
}
```

---

### `GET /api/history`

Returns the last 5 processed documents.

**Response:**
```json
{
  "documents": [
    {
      "id": 1,
      "file_name": "report.pdf",
      "summary": "The document covers...",
      "page_count": 42,
      "created_at": "2026-02-18 10:30:00"
    }
  ]
}
```
