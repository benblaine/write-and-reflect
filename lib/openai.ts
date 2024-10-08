import OpenAI from 'openai'

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
})

export async function generateMeditationText(prompt: string): Promise<string> {
  try {
    const completion = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [
        { 
          role: "system", 
          content: "You are creating vivid, concise meditation guidance. Use strong visual imagery and scenarios related to the user's input. Paint a clear picture in 2-3 short, impactful sentences. Focus on helping the user process their situation or prepare for the future. Ensure continuity with previous guidance if provided."
        },
        { role: "user", content: prompt },
      ],
      max_tokens: 100,
      temperature: 0.7,
    })

    return completion.choices[0].message.content || ''
  } catch (error) {
    console.error('Error generating meditation text:', error)
    throw error
  }
}