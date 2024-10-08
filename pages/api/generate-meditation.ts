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
      { 
        time: '0min', 
        title: 'Initial Guidance', 
        prompt: `Create a vivid, visual scenario for a meditation on "${input}". Set the scene in 2-3 short sentences, preparing the mind for 2 minutes of focused reflection.`
      },
      { 
        time: '2min', 
        title: 'Mid-Session Guidance', 
        prompt: `Continue the meditation on "${input}". Provide a powerful visual or scenario that builds upon the initial guidance. Use 2-3 concise sentences to guide the next 2 minutes of focused contemplation.`
      },
      { 
        time: '4min', 
        title: 'Closing Guidance', 
        prompt: `Conclude the meditation on "${input}" by bringing the journey full circle. Use 2-3 brief sentences to provide a final impactful image or scenario that ties back to the initial and mid-session guidance. Prepare for post-meditation reflection.`
      }
    ]

    let previousGuidance = ''
    const meditationTexts = await Promise.all(
      intervals.map(async (interval, index) => {
        const fullPrompt = `${interval.prompt} ${index > 0 ? `Previous guidance: ${previousGuidance}` : ''}`
        const generatedText = await generateMeditationText(fullPrompt)
        previousGuidance = generatedText
        return generatedText
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
    res.status(500).json({ message: 'Error generating meditation', error: error.message })
  }
}