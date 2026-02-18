import { NextResponse } from 'next/server'
import { getHistory } from '@/src/db/documents'

export const GET = () => {
  const documents = getHistory()

  return NextResponse.json({ documents })
}
