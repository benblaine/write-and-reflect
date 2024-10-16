import { NextResponse } from 'next/server'
import fs from 'fs'
import path from 'path'
import axios from 'axios'

const VOICE_ID = 'Sh5k24mRW3DPnrSD5Qsl'
const ELEVENLABS_API_KEY = process.env.ELEVENLABS_API_KEY

export async function POST(req: Request) {
  const { text } = await req.json()

  try {
    const url = `https://api.elevenlabs.io/v1/text-to-speech/${VOICE_ID}`
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
    }

    const response = await axios.post(url, data, { headers, responseType: 'arraybuffer' })

    const publicDir = path.join(process.cwd(), 'public')
    if (!fs.existsSync(publicDir)) {
      fs.mkdirSync(publicDir)
    }

    const outputPath = path.join(publicDir, 'output.mp3')
    fs.writeFileSync(outputPath, response.data)

    return NextResponse.json({ audioUrl: '/output.mp3' })
  } catch (error) {
    console.error('Error:', error)
    return NextResponse.json({ error: 'Failed to convert text to speech' }, { status: 500 })
  }
}