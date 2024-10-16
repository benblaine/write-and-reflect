import { NextResponse } from 'next/server'
import axios, { AxiosResponse, AxiosRequestConfig } from 'axios'

const VOICE_ID = 'eAXJo7EKR0HNAKpJEEUz'
const ELEVENLABS_API_KEY = process.env.ELEVENLABS_API_KEY
const MAX_RETRIES = 3
const INITIAL_DELAY = 1000 // 1 second

interface RequestData {
  text: string;
  model_id: string;
  voice_settings: {
    stability: number;
    similarity_boost: number;
    style: number;
  };
}

interface RequestHeaders {
  'Accept': string;
  'Content-Type': string;
  'xi-api-key': string;
}

async function makeRequest(url: string, data: RequestData, headers: RequestHeaders, retryCount = 0): Promise<AxiosResponse<ArrayBuffer>> {
  try {
    const config: AxiosRequestConfig = {
      headers,
      responseType: 'arraybuffer',
      timeout: 30000, // 30 seconds timeout
    };
    const response = await axios.post<ArrayBuffer>(url, data, config);
    return response;
  } catch (error) {
    if (retryCount < MAX_RETRIES) {
      const delay = INITIAL_DELAY * Math.pow(2, retryCount)
      console.log(`Retrying request (${retryCount + 1}/${MAX_RETRIES}) after ${delay}ms`)
      await new Promise(resolve => setTimeout(resolve, delay))
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

    const url = `https://api.elevenlabs.io/v1/text-to-speech/${VOICE_ID}`
    const headers: RequestHeaders = {
      'Accept': 'audio/mpeg',
      'Content-Type': 'application/json',
      'xi-api-key': ELEVENLABS_API_KEY,
    }
    const data: RequestData = {
      text,
      model_id: 'eleven_turbo_v2_5',
      voice_settings: {
        stability: 0.3,
        similarity_boost: 1.0,
        style: 0.5,
      },
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
        return NextResponse.json({ error: 'Request timed out' }, { status: 504 })
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