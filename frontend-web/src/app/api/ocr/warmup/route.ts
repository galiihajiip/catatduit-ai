import { NextResponse } from 'next/server'
import { warmupTesseract } from '@/lib/ocr'

export const runtime = 'nodejs'

export async function POST() {
  try {
    const start = Date.now()
    await warmupTesseract()
    return NextResponse.json({ ok: true, elapsed_ms: Date.now() - start })
  } catch (error) {
    return NextResponse.json(
      { ok: false, error: error instanceof Error ? error.message : 'warmup failed' },
      { status: 500 },
    )
  }
}
