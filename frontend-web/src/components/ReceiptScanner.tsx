'use client'

import { useState, useRef, useCallback } from 'react'
import { Icons } from './Icons'
import { formatCurrency } from '@/lib/utils'

interface ReceiptScannerProps {
  telegramId: string
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

export default function ReceiptScanner({ telegramId, onSuccess }: ReceiptScannerProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [mode, setMode] = useState<'upload' | 'camera'>('upload')
  const [isProcessing, setIsProcessing] = useState(false)
  const [scanResult, setScanResult] = useState<ScanResult | null>(null)
  const [error, setError] = useState<string | null>(null)
  
  const fileInputRef = useRef<HTMLInputElement>(null)
  const videoRef = useRef<HTMLVideoElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [stream, setStream] = useState<MediaStream | null>(null)

  const startCamera = async () => {
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment' } // Use back camera on mobile
      })
      setStream(mediaStream)
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream
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
  }

  const capturePhoto = useCallback(() => {
    if (!videoRef.current || !canvasRef.current) return

    const video = videoRef.current
    const canvas = canvasRef.current
    const context = canvas.getContext('2d')

    if (!context) return

    // Set canvas size to video size
    canvas.width = video.videoWidth
    canvas.height = video.videoHeight

    // Draw video frame to canvas
    context.drawImage(video, 0, 0, canvas.width, canvas.height)

    // Convert to blob and process
    canvas.toBlob(async (blob) => {
      if (blob) {
        await processImage(blob)
      }
    }, 'image/jpeg', 0.95)
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
    setIsProcessing(true)
    setError(null)
    setScanResult(null)

    try {
      const formData = new FormData()
      formData.append('file', imageFile)
      formData.append('telegram_id', telegramId)

      const response = await fetch('/api/ocr/scan-receipt', {
        method: 'POST',
        body: formData
      })

      const data = await response.json()

      if (response.ok && data.success) {
        setScanResult(data.receipt_data)
        stopCamera()
        if (onSuccess) onSuccess()
      } else {
        setError(data.detail || 'Gagal memproses struk')
      }
    } catch (err) {
      setError('Terjadi kesalahan saat memproses gambar')
      console.error('Process error:', err)
    } finally {
      setIsProcessing(false)
    }
  }

  const handleOpen = () => {
    setIsOpen(true)
    setScanResult(null)
    setError(null)
  }

  const handleClose = () => {
    setIsOpen(false)
    stopCamera()
    setScanResult(null)
    setError(null)
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
      <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
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
                disabled={isProcessing || !stream}
                className="w-full py-3 bg-primary text-white rounded-xl font-medium hover:bg-primary-light transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
              >
                <Icons.camera className="w-5 h-5" />
                {isProcessing ? 'Memproses...' : 'Ambil Foto'}
              </button>
            </div>
          )}

          {/* Processing State */}
          {isProcessing && (
            <div className="text-center py-8">
              <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
              <p className="text-text-primary font-medium">Memproses struk...</p>
              <p className="text-sm text-text-secondary mt-1">Mohon tunggu sebentar</p>
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

          {/* Success Result */}
          {scanResult && (
            <div className="space-y-4">
              <div className="bg-primary/10 border border-primary/20 rounded-xl p-4 flex items-start gap-3">
                <Icons.check className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-primary font-medium">Struk berhasil diproses!</p>
                  <p className="text-sm text-primary/80 mt-1">
                    Transaksi telah dicatat dan saldo dompet diperbarui
                  </p>
                </div>
              </div>

              {/* Receipt Details */}
              <div className="bg-gray-50 rounded-xl p-4 space-y-3">
                {scanResult.merchant && (
                  <div className="flex items-center justify-between">
                    <span className="text-text-secondary">Merchant</span>
                    <span className="font-medium text-text-primary">{scanResult.merchant}</span>
                  </div>
                )}
                <div className="flex items-center justify-between">
                  <span className="text-text-secondary">Total Belanja</span>
                  <span className="font-bold text-xl text-accent-red">
                    {formatCurrency(scanResult.total)}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-text-secondary">Jumlah Item</span>
                  <span className="font-medium text-text-primary">{scanResult.items_count}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-text-secondary">Confidence</span>
                  <span className={`font-medium ${
                    scanResult.confidence >= 0.8 ? 'text-primary' : 'text-accent-orange'
                  }`}>
                    {(scanResult.confidence * 100).toFixed(0)}%
                  </span>
                </div>
              </div>

              {/* Items List */}
              {scanResult.items && scanResult.items.length > 0 && (
                <div>
                  <h3 className="font-semibold text-text-primary mb-2">Detail Item</h3>
                  <div className="space-y-2">
                    {scanResult.items.map((item, index) => (
                      <div
                        key={index}
                        className="bg-white border border-gray-100 rounded-lg p-3 flex items-center justify-between"
                      >
                        <div className="flex-1">
                          <p className="font-medium text-text-primary">{item.name}</p>
                          <p className="text-sm text-text-secondary">
                            {item.quantity}x • {item.category}
                          </p>
                        </div>
                        <span className="font-medium text-text-primary">
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
