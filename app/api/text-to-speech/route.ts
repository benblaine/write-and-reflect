import { NextResponse } from 'next/server'
import axios from 'axios'

const VOICE_ID = 'eAXJo7EKR0HNAKpJEEUz'
const ELEVENLABS_API_KEY = process.env.ELEVENLABS_API_KEY
const MAX_RETRIES = 3
const INITIAL_TIMEOUT = 10000 // 10 seconds

async function makeRequest(url: string, data: any, headers: any, retryCount = 0) {
  try {
    const response = await axios.post(url, data, {
      headers,
      responseType: 'arraybuffer',
      timeout: INITIAL_TIMEOUT * Math.pow(2, retryCount), // Exponential backoff
    })
    return response
  } catch (error) {
    if (retryCount < MAX_RETRIES) {
      console.log(`Retry attempt ${retryCount + 1} for ElevenLabs API`)
      await new Promise(resolve => setTimeout(resolve, 1000 * Math.pow(2, retryCount))) // Wait before retrying
      return makeRequest(url, data, headers, retryCount + 1)
    }
    throw error
  }
}

export async function POST(req: Request) {
  try {
    const { text } = await req.json()

    if (!ELEVENLABS_API_KEY) {
      throw new Error('ELEVENLABS_API_KEY is not set')
    }

    const url = `https://api.elevenlabs.io/v1/text-to-speech/${VOICE_ID}/stream`
    const headers = {
      'Accept': 'audio/mpeg',
      'Content-Type': 'application/json',
      'xi-api-key': ELEVENLABS_API_KEY,
    }
    const data = {
      text,
      model_id: 'eleven_turbo_v2_5',
      voice_settings: {
        stability: 0.3,
        similarity_boost: 1.0,
        style: 0.5,
      },
      output_format: 'mp3_44100_128',
    }

    const response = await makeRequest(url, data, headers)

    return new NextResponse(response.data, {
      status: 200,
      headers: {
        'Content-Type': 'audio/mpeg',
      },
    })
  } catch (error) {
    console.error('Error in text-to-speech API:', error)
    
    if (axios.isAxiosError(error)) {
      if (error.code === 'ECONNABORTED') {
        return NextResponse.json({ error: 'Request timed out after multiple retries' }, { status: 504 })
      }
      if (error.response) {
        return NextResponse.json({ error: error.response.data }, { status: error.response.status })
      } else if (error.request) {
        return NextResponse.json({ error: 'No response received from server' }, { status: 503 })
      }
    }
    
    return NextResponse.json({ error: 'Failed to convert text to speech' }, { status: 500 })
  }
}