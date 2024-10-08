import { NextApiRequest, NextApiResponse } from 'next'
import { generateMeditationText } from '../../lib/openai'
import { generateSpeech } from '../../lib/elevenlabs'
import { MeditationAudio } from '../../lib/types'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' })
  }

  try {
    const { input } = req.body

    const intervals = [
      { time: '0min', title: 'Opening Guidance', stage: 'opening' as const },
      { time: '2min', title: 'Deepening Experience', stage: 'deepening' as const },
      { time: '4min', title: 'Guiding Towards Insight', stage: 'insight' as const },
    ]

    const meditationTexts = await Promise.all(
      intervals.map(async (interval) => {
        return generateMeditationText(input, interval.stage)
      })
    )

    const audioFiles: MeditationAudio[] = await Promise.all(
      meditationTexts.map(async (text, index) => {
        const audioUrl = await generateSpeech(text)
        return {
          title: intervals[index].title,
          url: audioUrl,
        }
      })
    )

    res.status(200).json(audioFiles)
  } catch (error) {
    console.error('Detailed error:', error)
    res.status(500).json({ message: 'Error generating meditation', error: error instanceof Error ? error.message : String(error) })
  }
}