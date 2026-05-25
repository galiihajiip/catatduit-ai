'use client'

import { useState, useRef, useCallback } from 'react'
import { Icons } from './Icons'
import { formatCurrency } from '@/lib/utils'

interface ReceiptScannerProps {
  userId: string
  onSuccess?: () => void
}

interface ScanResult {
  merchant: string | null
  total: number
  items_count: number
  items: Array<{
    name: string
    quantity: number
    price: number
    category: string
  }>
  confidence: number
}

const MAX_CLIENT_IMAGE_SIZE = 8 * 1024 * 1024
const MAX_CAMERA_IMAGE_WIDTH = 1280
const OCR_TIMEOUT_MS = 90_000

function canvasToBlob(canvas: HTMLCanvasElement): Promise<Blob> {
  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => {
        if (blob) resolve(blob)
        else reject(new Error('Gagal mengambil foto dari kamera'))
      },
      'image/jpeg',
      0.82
    )
  })
}

export default function ReceiptScanner({ userId, onSuccess }: ReceiptScannerProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [mode, setMode] = useState<'upload' | 'camera'>('upload')
  const [isProcessing, setIsProcessing] = useState(false)
  const [processingMessage, setProcessingMessage] = useState('Mohon tunggu sebentar')
  const [scanResult, setScanResult] = useState<ScanResult | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [demoWarning, setDemoWarning] = useState<string | null>(null)
  
  const fileInputRef = useRef<HTMLInputElement>(null)
  const videoRef = useRef<HTMLVideoElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [stream, setStream] = useState<MediaStream | null>(null)
  const [cameraReady, setCameraReady] = useState(false)

  const startCamera = async () => {
    try {
      setError(null)
      setCameraReady(false)
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: { ideal: 'environment' },
          width: { ideal: 1280 },
          height: { ideal: 720 },
        },
      })
      setStream(mediaStream)
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream
        await new Promise<void>((resolve) => {
          const video = videoRef.current
          if (!video || (video.readyState >= 2 && video.videoWidth > 0)) {
            resolve()
            return
          }
          video.onloadedmetadata = () => resolve()
          window.setTimeout(resolve, 2000)
        })
        await videoRef.current.play().catch(() => undefined)
        setCameraReady(true)
      }
    } catch (err) {
      setError('Tidak dapat mengakses kamera. Pastikan izin kamera sudah diberikan.')
      console.error('Camera error:', err)
    }
  }

  const stopCamera = () => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop())
      setStream(null)
    }
    setCameraReady(false)
  }

  const capturePhoto = useCallback(async () => {
    if (!videoRef.current || !canvasRef.current) {
      setError('Kamera belum siap. Tutup modal, buka kamera lagi, lalu coba ulang.')
      return
    }

    const video = videoRef.current
    const canvas = canvasRef.current
    const context = canvas.getContext('2d')

    if (!context) {
      setError('Browser tidak bisa membuat gambar dari kamera.')
      return
    }

    if (!video.videoWidth || !video.videoHeight) {
      setError('Preview kamera belum siap. Tunggu 1-2 detik lalu tekan Ambil Foto lagi.')
      return
    }

    setProcessingMessage('Mengambil dan mengompres foto struk...')
    const scale = Math.min(1, MAX_CAMERA_IMAGE_WIDTH / video.videoWidth)
    canvas.width = Math.round(video.videoWidth * scale)
    canvas.height = Math.round(video.videoHeight * scale)

    context.drawImage(video, 0, 0, canvas.width, canvas.height)

    try {
      const blob = await canvasToBlob(canvas)
      await processImage(blob)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Gagal mengambil foto dari kamera')
      setIsProcessing(false)
    }
  }, [])

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    if (!file.type.startsWith('image/')) {
      setError('File harus berupa gambar')
      return
    }

    await processImage(file)
  }

  const processImage = async (imageFile: Blob) => {
    if (imageFile.size > MAX_CLIENT_IMAGE_SIZE) {
      setError('Foto terlalu besar. Coba ambil foto lebih dekat atau gunakan upload gambar yang lebih kecil.')
      return
    }

    setIsProcessing(true)
    setProcessingMessage('Mengirim foto ke OCR lokal...')
    setError(null)
    setDemoWarning(null)
    setScanResult(null)

    const controller = new AbortController()
    const timeout = window.setTimeout(() => controller.abort(), OCR_TIMEOUT_MS)

    try {
      const formData = new FormData()
      formData.append('file', imageFile, 'receipt.jpg')
      formData.append('user_id', userId)

      const response = await fetch('/api/ocr/scan-receipt', {
        method: 'POST',
        body: formData,
        signal: controller.signal,
      })
      setProcessingMessage('Membaca hasil OCR...')

      const text = await response.text()
      let data: {
        success?: boolean
        demo_mode?: boolean
        message?: string
        receipt_data?: ScanResult
        error?: string
        detail?: string
      }
      try {
        data = text ? JSON.parse(text) : {}
      } catch {
        setError('Server mengembalikan respons tidak valid. Coba lagi atau restart npm run dev.')
        return
      }

      if (response.ok && data.success && data.receipt_data) {
        setScanResult(data.receipt_data)
        setDemoWarning(data.demo_mode ? (data.message ?? null) : null)
        stopCamera()
        if (onSuccess && !data.demo_mode) onSuccess()
      } else {
        setError(data.detail || data.error || 'Gagal memproses struk')
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Terjadi kesalahan saat memproses gambar'
      setError(
        err instanceof DOMException && err.name === 'AbortError'
          ? 'OCR lokal terlalu lama memproses foto. Coba foto struk lebih terang, lebih dekat, dan pastikan hanya area struk yang terlihat.'
          : /failed to fetch/i.test(message)
          ? 'Tidak bisa menghubungi server OCR lokal. Pastikan npm run dev masih berjalan, lalu coba lagi.'
          : message
      )
      console.error('Process error:', err)
    } finally {
      window.clearTimeout(timeout)
      setIsProcessing(false)
    }
  }

  const handleOpen = () => {
    setIsOpen(true)
    setScanResult(null)
    setError(null)
    setDemoWarning(null)
  }

  const handleClose = () => {
    setIsOpen(false)
    stopCamera()
    setScanResult(null)
    setError(null)
    setDemoWarning(null)
  }

  const switchToCamera = () => {
    setMode('camera')
    startCamera()
  }

  const switchToUpload = () => {
    setMode('upload')
    stopCamera()
  }

  if (!isOpen) {
    return (
      <button
        onClick={handleOpen}
        className="fixed bottom-20 right-4 lg:bottom-8 lg:right-8 w-14 h-14 bg-gradient-to-br from-primary to-primary-light text-white rounded-full shadow-xl hover:shadow-2xl transition-all hover:scale-110 flex items-center justify-center z-50"
      >
        <Icons.camera className="w-6 h-6" />
      </button>
    )
  }

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white text-black rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-gray-100 p-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Icons.camera className="w-5 h-5 text-primary" />
            <h2 className="text-lg font-semibold text-text-primary">Scan Struk Belanja</h2>
          </div>
          <button
            onClick={handleClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <Icons.close className="w-5 h-5 text-text-secondary" />
          </button>
        </div>

        {/* Mode Selector */}
        {!scanResult && (
          <div className="p-4 border-b border-gray-100">
            <div className="flex gap-2 bg-gray-100 rounded-lg p-1">
              <button
                onClick={switchToUpload}
                className={`flex-1 py-2 px-4 rounded-md font-medium transition-colors ${
                  mode === 'upload'
                    ? 'bg-white text-primary shadow-sm'
                    : 'text-text-secondary hover:text-text-primary'
                }`}
              >
                <Icons.upload className="w-4 h-4 inline mr-2" />
                Upload
              </button>
              <button
                onClick={switchToCamera}
                className={`flex-1 py-2 px-4 rounded-md font-medium transition-colors ${
                  mode === 'camera'
                    ? 'bg-white text-primary shadow-sm'
                    : 'text-text-secondary hover:text-text-primary'
                }`}
              >
                <Icons.camera className="w-4 h-4 inline mr-2" />
                Kamera
              </button>
            </div>
          </div>
        )}

        {/* Content */}
        <div className="p-6">
          {/* Upload Mode */}
          {mode === 'upload' && !scanResult && (
            <div>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleFileSelect}
                className="hidden"
              />
              <button
                onClick={() => fileInputRef.current?.click()}
                disabled={isProcessing}
                className="w-full border-2 border-dashed border-gray-300 rounded-xl p-12 hover:border-primary hover:bg-primary/5 transition-colors disabled:opacity-50"
              >
                <Icons.upload className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-text-primary font-medium mb-1">
                  {isProcessing ? 'Memproses...' : 'Klik untuk upload foto struk'}
                </p>
                <p className="text-sm text-text-secondary">
                  Atau drag & drop file gambar di sini
                </p>
              </button>
            </div>
          )}

          {/* Camera Mode */}
          {mode === 'camera' && !scanResult && (
            <div className="space-y-4">
              <div className="relative bg-black rounded-xl overflow-hidden">
                <video
                  ref={videoRef}
                  autoPlay
                  playsInline
                  className="w-full h-auto"
                />
                <canvas ref={canvasRef} className="hidden" />
              </div>
              <button
                onClick={capturePhoto}
                disabled={isProcessing || !stream || !cameraReady}
                className="w-full py-3 bg-primary text-white rounded-xl font-medium hover:bg-primary-light transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
              >
                <Icons.camera className="w-5 h-5" />
                {isProcessing ? 'Memproses...' : cameraReady ? 'Ambil Foto' : 'Menyiapkan Kamera...'}
              </button>
              <p className="text-center text-xs font-medium text-gray-600">
                Pastikan struk terang, tidak miring, dan memenuhi sebagian besar layar.
              </p>
            </div>
          )}

          {/* Processing State */}
          {isProcessing && (
            <div className="text-center py-8">
              <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
              <p className="text-text-primary font-medium">Memproses struk...</p>
              <p className="text-sm text-text-secondary mt-1">{processingMessage}</p>
            </div>
          )}

          {/* Error State */}
          {error && (
            <div className="bg-accent-red/10 border border-accent-red/20 rounded-xl p-4 flex items-start gap-3">
              <Icons.alertCircle className="w-5 h-5 text-accent-red flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-accent-red font-medium">Gagal memproses</p>
                <p className="text-sm text-accent-red/80 mt-1">{error}</p>
              </div>
            </div>
          )}

          {demoWarning && (
            <div className="bg-accent-orange/10 border border-accent-orange/20 rounded-xl p-4 flex items-start gap-3">
              <Icons.alertCircle className="w-5 h-5 text-accent-orange flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-accent-orange font-medium">Mode demo</p>
                <p className="text-sm text-accent-orange/80 mt-1">{demoWarning}</p>
              </div>
            </div>
          )}

          {/* Success Result */}
          {scanResult && (
            <div className="space-y-4">
              <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4 flex items-start gap-3 text-black">
                <Icons.check className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-black font-bold">Struk berhasil dibaca!</p>
                  <p className="text-sm text-black font-medium mt-1">
                    {demoWarning
                      ? 'Data struk tampil di bawah. Simpan ke database butuh konfigurasi Supabase.'
                      : 'Transaksi telah dicatat dan saldo dompet diperbarui'}
                  </p>
                </div>
              </div>

              {/* Receipt Details */}
              <div className="bg-gray-50 rounded-xl p-4 space-y-3 text-gray-950">
                {scanResult.merchant && (
                  <div className="flex items-center justify-between">
                    <span className="font-medium text-gray-700">Merchant</span>
                    <span className="font-semibold text-gray-950">{scanResult.merchant}</span>
                  </div>
                )}
                <div className="flex items-center justify-between">
                  <span className="font-medium text-gray-700">Total Belanja</span>
                  <span className="font-bold text-xl text-accent-red">
                    {formatCurrency(scanResult.total)}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="font-medium text-gray-700">Jumlah Item</span>
                  <span className="font-semibold text-gray-950">{scanResult.items_count}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="font-medium text-gray-700">Confidence</span>
                  <span className={`font-bold ${
                    scanResult.confidence >= 0.8 ? 'text-primary' : 'text-accent-orange'
                  }`}>
                    {(scanResult.confidence * 100).toFixed(0)}%
                  </span>
                </div>
              </div>

              {/* Items List */}
              {scanResult.items && scanResult.items.length > 0 && (
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="font-bold text-gray-950">Detail Item</h3>
                    <span className="text-sm font-medium text-gray-700">
                      {scanResult.items.length} item terbaca
                    </span>
                  </div>
                  <div className="space-y-2 max-h-[50vh] overflow-y-auto pr-1">
                    {scanResult.items.map((item, index) => (
                      <div
                        key={`${item.name}-${item.price}-${index}`}
                        className="bg-white border border-gray-200 rounded-lg p-3 flex items-start justify-between gap-3 shadow-sm"
                      >
                        <div className="min-w-0 flex-1">
                          <p className="font-semibold text-gray-950 break-words">{item.name}</p>
                          <p className="text-sm font-medium text-gray-700">
                            {item.quantity}x • {item.category}
                          </p>
                        </div>
                        <span className="font-bold text-gray-950 whitespace-nowrap">
                          {formatCurrency(item.price)}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <button
                onClick={handleClose}
                className="w-full py-3 bg-primary text-white rounded-xl font-medium hover:bg-primary-light transition-colors"
              >
                Selesai
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
