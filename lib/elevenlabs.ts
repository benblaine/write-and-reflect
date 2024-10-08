import { ElevenLabsClient } from "elevenlabs";

const ELEVENLABS_API_KEY = process.env.ELEVENLABS_API_KEY;
const ELEVENLABS_VOICE_ID = process.env.ELEVENLABS_VOICE_ID || "Rachel";

const client = new ElevenLabsClient({
  apiKey: ELEVENLABS_API_KEY,
});

export async function generateSpeech(text: string): Promise<string> {
  try {
    const audio = await client.generate({
      voice: ELEVENLABS_VOICE_ID,
      model_id: "eleven_turbo_v2_5",
      text,
    });

    const chunks: Buffer[] = [];
    for await (const chunk of audio) {
      chunks.push(Buffer.from(chunk));
    }
    const audioBuffer = Buffer.concat(chunks);
    const base64Audio = audioBuffer.toString('base64');
    return `data:audio/mpeg;base64,${base64Audio}`;
  } catch (error) {
    console.error('Error generating speech:', error);
    throw error;
  }
}