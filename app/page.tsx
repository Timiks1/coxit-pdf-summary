'use client'

import { useState, useRef, useEffect, useCallback, DragEvent, ChangeEvent } from 'react'

interface HistoryDocument {
  id: number
  file_name: string
  summary: string
  page_count: number
  created_at: string
}

interface SummaryResult {
  summary: string
  file_name: string
  page_count: number
}

const PROCESSING_STEPS = [
  'Converting PDF pages to images...',
  'Analyzing document structure...',
  'Processing chunks in parallel...',
  'Generating section summaries...',
  'Merging into final summary...',
]

const formatDate = (date_str: string) =>
  new Date(date_str).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  })

const SummaryText = ({ text }: { text: string }) => {
  const lines = text.split('\n').filter(Boolean)

  return (
    <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.8rem', lineHeight: '1.7' }}>
      {lines.map((line, i) => {
        if (line.startsWith('## ')) {
          return (
            <p key={i} style={{ color: 'var(--accent)', fontWeight: 500, marginTop: '1rem', marginBottom: '0.25rem' }}>
              {line.replace('## ', '')}
            </p>
          )
        }

        if (line.startsWith('# ')) {
          return (
            <p key={i} style={{ color: 'var(--accent)', fontWeight: 500, fontSize: '0.9rem', marginTop: '1.25rem', marginBottom: '0.25rem' }}>
              {line.replace('# ', '')}
            </p>
          )
        }

        if (line.startsWith('- ') || line.startsWith('• ')) {
          return (
            <p key={i} style={{ color: 'var(--text-primary)', paddingLeft: '1rem' }}>
              <span style={{ color: 'var(--accent)', marginRight: '0.5rem' }}>›</span>
              {line.replace(/^[-•]\s/, '')}
            </p>
          )
        }

        return (
          <p key={i} style={{ color: 'var(--text-primary)', marginBottom: '0.25rem' }}>
            {line}
          </p>
        )
      })}
    </div>
  )
}

export default function Page() {
  const [file, setFile] = useState<File | null>(null)
  const [dragging, setDragging] = useState(false)
  const [loading, setLoading] = useState(false)
  const [step_index, setStepIndex] = useState(0)
  const [result, setResult] = useState<SummaryResult | null>(null)
  const [history, setHistory] = useState<HistoryDocument[]>([])
  const [expanded_id, setExpandedId] = useState<number | null>(null)

  const file_input_ref = useRef<HTMLInputElement>(null)

  const fetchHistory = useCallback(async () => {
    const response = await fetch('/api/history')
    const data = await response.json()

    setHistory(data.documents)
  }, [])

  useEffect(() => {
    fetchHistory()
  }, [fetchHistory])

  useEffect(() => {
    if (!loading) return

    const interval = setInterval(() => {
      setStepIndex(prev => (prev + 1) % PROCESSING_STEPS.length)
    }, 2200)

    return () => clearInterval(interval)
  }, [loading])

  const handleDragOver = useCallback((e: DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    setDragging(true)
  }, [])

  const handleDragLeave = useCallback(() => {
    setDragging(false)
  }, [])

  const handleDrop = useCallback((e: DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    setDragging(false)

    const dropped = e.dataTransfer.files[0]

    if (dropped?.type === 'application/pdf') {
      setFile(dropped)
    }
  }, [])

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    const selected = e.target.files?.[0]

    if (selected) setFile(selected)
  }

  const handleSubmit = async () => {
    if (!file || loading) return

    setLoading(true)
    setResult(null)
    setStepIndex(0)

    const form_data = new FormData()
    form_data.append('file', file)

    const response = await fetch('/api/upload', { method: 'POST', body: form_data })
    const data = await response.json()

    setResult(data)
    setLoading(false)
    await fetchHistory()
  }

  const toggleExpand = (id: number) => {
    setExpandedId(prev => (prev === id ? null : id))
  }

  return (
    <main
      className="min-h-screen relative overflow-x-hidden"
      style={{ background: 'var(--background)', fontFamily: 'var(--font-body)' }}
    >
      {/* Grid background */}
      <div className="fixed inset-0 grid-bg pointer-events-none" />

      {/* Ambient glow */}
      <div
        className="fixed top-0 left-1/2 -translate-x-1/2 w-[600px] h-[400px] pointer-events-none"
        style={{
          background: 'radial-gradient(ellipse at center, rgba(232,160,32,0.06) 0%, transparent 70%)',
        }}
      />

      <div className="relative max-w-3xl mx-auto px-6 py-12">

        {/* Header */}
        <div className="mb-12">
          <div className="flex items-center gap-3 mb-3">
            <div
              className="w-2 h-2 rounded-full animate-pulse-amber"
              style={{ background: 'var(--accent)' }}
            />
            <span
              style={{ fontFamily: 'var(--font-mono)', fontSize: '0.7rem', color: 'var(--text-muted)', letterSpacing: '0.15em' }}
            >
              SYSTEM ACTIVE
            </span>
          </div>
          <h1
            style={{
              fontFamily: 'var(--font-display)',
              fontSize: 'clamp(2.5rem, 6vw, 4rem)',
              fontWeight: 800,
              color: 'var(--text-primary)',
              lineHeight: 1,
              letterSpacing: '-0.02em',
            }}
          >
            PDF SUMMARY
            <span style={{ color: 'var(--accent)' }}> AI</span>
          </h1>
          <p style={{ color: 'var(--text-muted)', marginTop: '0.75rem', fontSize: '0.9rem', fontWeight: 300 }}>
            Upload any PDF — tables, images, scans — and receive an AI-generated summary.
          </p>
        </div>

        {/* Upload section */}
        <section className="mb-8">
          <div
            className="relative overflow-hidden cursor-pointer transition-all duration-200"
            style={{
              border: `1.5px dashed ${dragging ? 'var(--accent)' : 'var(--border-bright)'}`,
              borderRadius: '8px',
              background: dragging ? 'var(--accent-dim)' : 'var(--surface)',
              padding: '2.5rem',
              textAlign: 'center',
            }}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            onClick={() => file_input_ref.current?.click()}
          >
            {dragging && (
              <div
                className="scan-line absolute left-0 right-0 h-px pointer-events-none"
                style={{ background: 'linear-gradient(90deg, transparent, var(--accent), transparent)' }}
              />
            )}

            <input
              ref={file_input_ref}
              type="file"
              accept=".pdf"
              className="hidden"
              onChange={handleFileChange}
              onClick={e => e.stopPropagation()}
            />

            <div
              className="mx-auto mb-4 flex items-center justify-center"
              style={{
                width: '52px',
                height: '52px',
                border: `1px solid ${file ? 'var(--accent)' : 'var(--border-bright)'}`,
                borderRadius: '6px',
                background: file ? 'var(--accent-dim)' : 'transparent',
              }}
            >
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                <path
                  d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8L14 2z"
                  stroke={file ? 'var(--accent)' : 'var(--text-muted)'}
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                <polyline
                  points="14 2 14 8 20 8"
                  stroke={file ? 'var(--accent)' : 'var(--text-muted)'}
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </div>

            {file ? (
              <div>
                <p style={{ color: 'var(--accent)', fontWeight: 500, marginBottom: '0.25rem' }}>
                  {file.name}
                </p>
                <p style={{ color: 'var(--text-muted)', fontSize: '0.8rem', fontFamily: 'var(--font-mono)' }}>
                  {(file.size / 1024 / 1024).toFixed(2)} MB · click to replace
                </p>
              </div>
            ) : (
              <div>
                <p style={{ color: 'var(--text-primary)', fontWeight: 500, marginBottom: '0.25rem' }}>
                  Drop your PDF here
                </p>
                <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                  or click to browse · up to 50 MB, 100 pages
                </p>
              </div>
            )}
          </div>

          <button
            onClick={handleSubmit}
            disabled={!file || loading}
            className="w-full mt-4 transition-all duration-200"
            style={{
              padding: '0.9rem 2rem',
              borderRadius: '6px',
              background: file && !loading ? 'var(--accent)' : 'var(--surface)',
              border: `1px solid ${file && !loading ? 'var(--accent)' : 'var(--border)'}`,
              color: file && !loading ? '#07090f' : 'var(--text-muted)',
              fontFamily: 'var(--font-display)',
              fontWeight: 700,
              fontSize: '1rem',
              letterSpacing: '0.08em',
              cursor: file && !loading ? 'pointer' : 'not-allowed',
            }}
          >
            {loading ? (
              <span className="flex items-center justify-center gap-3">
                <span
                  className="inline-block w-4 h-4 rounded-full border-2 animate-spin"
                  style={{ borderColor: 'var(--text-muted)', borderTopColor: 'transparent' }}
                />
                PROCESSING
              </span>
            ) : (
              'GENERATE SUMMARY'
            )}
          </button>
        </section>

        {/* Processing state */}
        {loading && (
          <section
            className="mb-8 animate-slide-up"
            style={{
              background: 'var(--surface)',
              border: '1px solid var(--border)',
              borderRadius: '8px',
              padding: '1.5rem',
            }}
          >
            <div className="flex items-start gap-4">
              <div style={{ flexShrink: 0, paddingTop: '2px' }}>
                <div className="w-2 h-2 rounded-full animate-pulse-amber" style={{ background: 'var(--accent)' }} />
              </div>
              <div className="flex-1">
                <p style={{ fontFamily: 'var(--font-mono)', fontSize: '0.8rem', color: 'var(--accent)', marginBottom: '1rem' }}>
                  {PROCESSING_STEPS[step_index]}
                </p>
                <div style={{ height: '2px', background: 'var(--border)', borderRadius: '2px', overflow: 'hidden' }}>
                  <div className="h-full shimmer" style={{ borderRadius: '2px' }} />
                </div>
                <p style={{ color: 'var(--text-muted)', fontSize: '0.75rem', marginTop: '0.75rem', fontFamily: 'var(--font-mono)' }}>
                  Large documents may take a few minutes
                </p>
              </div>
            </div>
          </section>
        )}

        {/* Summary result */}
        {result && (
          <section className="mb-10 animate-slide-up">
            <div style={{ border: '1px solid var(--border-bright)', borderRadius: '8px', overflow: 'hidden' }}>
              <div
                style={{
                  background: 'var(--surface-alt)',
                  borderBottom: '1px solid var(--border)',
                  padding: '1rem 1.5rem',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                }}
              >
                <div>
                  <p style={{ fontFamily: 'var(--font-display)', fontWeight: 700, letterSpacing: '0.05em', fontSize: '0.9rem' }}>
                    {result.file_name}
                  </p>
                  <p style={{ fontFamily: 'var(--font-mono)', fontSize: '0.7rem', color: 'var(--text-muted)', marginTop: '0.2rem' }}>
                    {result.page_count} pages processed
                  </p>
                </div>
                <div
                  style={{
                    background: 'var(--accent-dim)',
                    border: '1px solid rgba(232,160,32,0.3)',
                    borderRadius: '4px',
                    padding: '0.25rem 0.75rem',
                    fontFamily: 'var(--font-mono)',
                    fontSize: '0.7rem',
                    color: 'var(--accent)',
                    letterSpacing: '0.1em',
                  }}
                >
                  COMPLETE
                </div>
              </div>
              <div style={{ padding: '1.5rem', background: 'var(--surface)' }}>
                <SummaryText text={result.summary} />
              </div>
            </div>
          </section>
        )}

        {/* History */}
        {history.length > 0 && (
          <section>
            <div className="flex items-center gap-4 mb-5">
              <h2
                style={{
                  fontFamily: 'var(--font-display)',
                  fontWeight: 700,
                  fontSize: '0.85rem',
                  letterSpacing: '0.15em',
                  color: 'var(--text-muted)',
                  whiteSpace: 'nowrap',
                }}
              >
                RECENT DOCUMENTS
              </h2>
              <div style={{ flex: 1, height: '1px', background: 'var(--border)' }} />
            </div>

            <div className="flex flex-col gap-3">
              {history.map(doc => (
                <div
                  key={doc.id}
                  style={{
                    background: 'var(--surface)',
                    border: '1px solid var(--border)',
                    borderRadius: '6px',
                    overflow: 'hidden',
                    transition: 'border-color 0.15s ease',
                  }}
                  onMouseEnter={e => (e.currentTarget.style.borderColor = 'var(--border-bright)')}
                  onMouseLeave={e => (e.currentTarget.style.borderColor = 'var(--border)')}
                >
                  <button
                    onClick={() => toggleExpand(doc.id)}
                    className="w-full text-left"
                    style={{ padding: '1rem 1.25rem', cursor: 'pointer', background: 'transparent', border: 'none' }}
                  >
                    <div className="flex items-center justify-between gap-4">
                      <div className="flex items-center gap-3 min-w-0">
                        <div
                          style={{
                            width: '6px',
                            height: '6px',
                            borderRadius: '50%',
                            background: 'var(--border-bright)',
                            flexShrink: 0,
                          }}
                        />
                        <span
                          style={{
                            fontWeight: 500,
                            fontSize: '0.875rem',
                            color: 'var(--text-primary)',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            whiteSpace: 'nowrap',
                          }}
                        >
                          {doc.file_name}
                        </span>
                      </div>

                      <div className="flex items-center gap-4 flex-shrink-0">
                        <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.7rem', color: 'var(--text-muted)' }}>
                          {doc.page_count}p
                        </span>
                        <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.7rem', color: 'var(--text-muted)' }}>
                          {formatDate(doc.created_at)}
                        </span>
                        <span
                          style={{
                            color: 'var(--text-muted)',
                            fontSize: '0.75rem',
                            display: 'inline-block',
                            transition: 'transform 0.2s ease',
                            transform: expanded_id === doc.id ? 'rotate(180deg)' : 'rotate(0deg)',
                          }}
                        >
                          ▾
                        </span>
                      </div>
                    </div>

                    {expanded_id !== doc.id && (
                      <p
                        style={{
                          color: 'var(--text-muted)',
                          fontSize: '0.78rem',
                          marginTop: '0.5rem',
                          paddingLeft: '1.125rem',
                          overflow: 'hidden',
                          display: '-webkit-box',
                          WebkitLineClamp: 2,
                          WebkitBoxOrient: 'vertical',
                          lineHeight: '1.5',
                        }}
                      >
                        {doc.summary}
                      </p>
                    )}
                  </button>

                  {expanded_id === doc.id && (
                    <div style={{ borderTop: '1px solid var(--border)', padding: '1.25rem', background: 'rgba(12,17,24,0.6)' }}>
                      <SummaryText text={doc.summary} />
                    </div>
                  )}
                </div>
              ))}
            </div>
          </section>
        )}

        <div className="mt-16 pt-6" style={{ borderTop: '1px solid var(--border)' }}>
          <p style={{ fontFamily: 'var(--font-mono)', fontSize: '0.7rem', color: 'var(--text-faint)', textAlign: 'center', letterSpacing: '0.1em' }}>
            POWERED BY GPT-5.1 VISION · MAP-REDUCE PIPELINE
          </p>
        </div>
      </div>
    </main>
  )
}
