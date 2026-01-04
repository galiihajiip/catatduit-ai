import { NextResponse } from 'next/server'

/**
 * Test endpoint to check if Google Vision API is configured
 * Access: /api/ocr/test
 */
export async function GET() {
  const apiKey = process.env.GOOGLE_CLOUD_VISION_API_KEY
  
  if (!apiKey) {
    return NextResponse.json({
      configured: false,
      message: 'Google Vision API key not found',
      instructions: [
        '1. Go to Vercel Dashboard → Your Project → Settings → Environment Variables',
        '2. Add: GOOGLE_CLOUD_VISION_API_KEY = your_api_key',
        '3. Redeploy the app',
        '',
        'Or get API key from: https://console.cloud.google.com/apis/credentials'
      ]
    })
  }

  // Test the API key
  try {
    const testImage = 'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==' // 1x1 transparent PNG
    
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

    if (response.ok) {
      return NextResponse.json({
        configured: true,
        working: true,
        message: 'Google Vision API is working!',
        apiKeyPrefix: apiKey.substring(0, 10) + '...',
        testResponse: data
      })
    } else {
      return NextResponse.json({
        configured: true,
        working: false,
        message: 'API key found but not working',
        error: data.error?.message || 'Unknown error',
        suggestions: [
          'Check if Vision API is enabled in Google Cloud Console',
          'Verify API key restrictions',
          'Make sure billing is enabled'
        ]
      }, { status: 400 })
    }
  } catch (error: any) {
    return NextResponse.json({
      configured: true,
      working: false,
      message: 'Error testing API',
      error: error.message
    }, { status: 500 })
  }
}
