import { NextResponse } from 'next/server'

/**
 * Test endpoint to verify Google Cloud Vision API is working
 * Visit: /api/ocr/test-vision
 */
export async function GET() {
  const apiKey = process.env.GOOGLE_CLOUD_VISION_API_KEY
  
  if (!apiKey) {
    return NextResponse.json({
      success: false,
      error: 'GOOGLE_CLOUD_VISION_API_KEY not set',
      message: 'Set this environment variable in Vercel'
    }, { status: 500 })
  }
  
  // Simple test image (1x1 white pixel PNG in base64)
  const testImage = 'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8/5+hHgAHggJ/PchI7wAAAABJRU5ErkJggg=='
  
  try {
    const response = await fetch(
      `https://vision.googleapis.com/v1/images:annotate?key=${apiKey}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          requests: [{
            image: { content: testImage },
            features: [{ type: 'TEXT_DETECTION' }]
          }]
        })
      }
    )
    
    const data = await response.json()
    
    if (!response.ok) {
      return NextResponse.json({
        success: false,
        error: 'Vision API returned error',
        status: response.status,
        details: data,
        message: data.error?.message || 'Unknown error'
      }, { status: response.status })
    }
    
    return NextResponse.json({
      success: true,
      message: '✅ Google Cloud Vision API is working!',
      apiKeyPrefix: apiKey.substring(0, 10) + '...',
      response: data
    })
    
  } catch (error: any) {
    return NextResponse.json({
      success: false,
      error: 'Failed to call Vision API',
      message: error.message,
      details: error
    }, { status: 500 })
  }
}
