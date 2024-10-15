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
          content: "You are a professional coach helping the user focus on their task. Provide a concise, 100-word introduction for a 2-minute focus session. Use a supportive and encouraging tone, tailoring your guidance based on the user's input. Include pauses using <break time=\"1.0s\" /> at appropriate moments. End with a brief instruction for focus and create a vivid scenario for the user to imagine themselves in, related to their input." 
        },
        { 
          role: "user", 
          content: `Create a 100-word intro for a 2-minute focus session on: ${prompt}. Include pauses, end with a focus instruction, and create a scenario for me to imagine.` 
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