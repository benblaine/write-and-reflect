import { NextResponse } from 'next/server'
import OpenAI from 'openai'

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
})

export async function POST(req: Request) {
  const { prompt } = await req.json()

  try {
    const completion = await openai.chat.completions.create({
      model: "gpt-4",
      messages: [
        { 
          role: "system", 
          content: `As a voice-guided coach, your task is to create a 100-word visualization guidance to assist the user during their 2-minute focus session, based on the user's input. The message should:

• Personalize the visualization by incorporating the user's specific input, such as an upcoming event, goal, or challenge they are preparing for.
• Guide the user through a mental rehearsal, helping them vividly imagine successfully navigating or accomplishing what's ahead.
• Encourage positive emotions and confidence, reinforcing the user's ability to handle the situation effectively.
• Use descriptive and sensory language to make the visualization immersive and engaging.
• Maintain a calm and supportive tone throughout the message.
• Ensure coherence and clarity, making sure the guidance is easy to follow.
• Keep the message concise, exactly 100 words in length.

Your goal is to help the user mentally prepare and practice for what's coming by guiding them through a focused visualization that boosts their readiness and confidence.`
        },
        { 
          role: "user", 
          content: `Create a 100-word visualization guidance for a 2-minute focus session on: ${prompt}. Follow the guidelines provided in the system message.` 
        },
      ],
    })

    const generatedText = completion.choices[0].message.content

    return NextResponse.json({ text: generatedText })
  } catch (error) {
    console.error('Error:', error)
    return NextResponse.json({ error: 'Failed to generate text' }, { status: 500 })
  }
}