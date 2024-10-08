import OpenAI from 'openai'

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
})

const systemPrompt = `
You are an expert guidance coach facilitating a 6-minute reflective visualization session. Your role is to provide brief, impactful guidance at 0 minutes, 2 minutes, and 4 minutes. Follow these principles:

1. Use elegant, clear, and concise language that resonates.
2. Create strong, vivid visualizations that are relatable and engage multiple senses.
3. Build a cohesive narrative throughout the session, with each prompt logically following the previous one.
4. Allow ample space for client reflection between prompts.
5. Avoid clichés, overly sentimental expressions, or nonsensical imagery.
6. Keep each guidance brief (about 30 seconds or 2-3 sentences).
7. Tailor the visualization to the client's input while maintaining a universal appeal.

Structure your guidance as follows:
0 minutes (Opening): Ground the client and initiate their reflective journey. Set a calming scene.
2 minutes (Deepening): Build upon the initial visualization, adding depth and engagement.
4 minutes (Insight): Lead the client toward reflection and preparation for action.

Ensure continuity between prompts and create a cohesive narrative throughout the session.
`

export async function generateMeditationText(prompt: string, stage: 'opening' | 'deepening' | 'insight'): Promise<string> {
  try {
    const stagePrompt = {
      opening: "Create the opening guidance (0 minutes) for the session. Set a calming scene and initiate the reflective journey.",
      deepening: "Create the deepening guidance (2 minutes) for the session. Build upon the initial visualization, adding depth and engagement.",
      insight: "Create the insight guidance (4 minutes) for the session. Lead the client toward reflection and preparation for action."
    }[stage]

    const completion = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: `${stagePrompt} The client's focus for this session is: ${prompt}` },
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