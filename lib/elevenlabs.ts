import { ElevenLabsClient } from "elevenlabs";
import { createWriteStream } from "fs";
import { v4 as uuid } from "uuid";
import path from "path";

const ELEVENLABS_API_KEY = process.env.ELEVENLABS_API_KEY;
const ELEVENLABS_VOICE_ID = process.env.ELEVENLABS_VOICE_ID || "Rachel";

const client = new ElevenLabsClient({
  apiKey: ELEVENLABS_API_KEY,
});

export async function generateSpeech(text: string): Promise<string> {
  return new Promise<string>(async (resolve, reject) => {
    try {
      const audio = await client.generate({
        voice: ELEVENLABS_VOICE_ID,
        model_id: "eleven_turbo_v2_5",
        text,
      });

      const fileName = `${uuid()}.mp3`;
      const filePath = path.join(process.cwd(), 'public', fileName);
      const fileStream = createWriteStream(filePath);

      audio.pipe(fileStream);
      fileStream.on("finish", () => resolve(`/${fileName}`)); // Resolve with the public URL
      fileStream.on("error", reject);
    } catch (error) {
      console.error('Error generating speech:', error);
      reject(error);
    }
  });
}