function isNetworkFailure(message: string): boolean {
  const lower = message.toLowerCase()
  return (
    lower.includes('fetch failed') ||
    lower.includes('connect timeout') ||
    lower.includes('socket') ||
    lower.includes('econnreset') ||
    lower.includes('enotfound') ||
    lower.includes('network')
  )
}

export function formatApiError(error: unknown): string {
  if (error instanceof Error) {
    if (isNetworkFailure(error.message)) {
      return 'Koneksi ke database gagal. Periksa internet Anda lalu coba lagi.'
    }
    return error.message
  }

  if (error && typeof error === 'object') {
    const record = error as Record<string, unknown>
    const message = typeof record.message === 'string' ? record.message : ''
    const details = typeof record.details === 'string' ? record.details : ''
    const combined = `${message}\n${details}`.trim()

    if (combined && isNetworkFailure(combined)) {
      return 'Koneksi ke database gagal. Periksa internet Anda lalu coba lagi.'
    }
    if (message) return message
    if (details) return details.split('\n')[0]
  }

  return 'Terjadi kesalahan. Silakan coba lagi.'
}

export async function withNetworkRetry<T>(
  operation: () => Promise<T>,
  retries = 1,
): Promise<T> {
  let lastError: unknown
  for (let attempt = 0; attempt <= retries; attempt += 1) {
    try {
      return await operation()
    } catch (error) {
      lastError = error
      const message = formatApiError(error)
      if (!isNetworkFailure(message) || attempt >= retries) {
        throw error
      }
      await new Promise((resolve) => setTimeout(resolve, 400 * (attempt + 1)))
    }
  }
  throw lastError
}
