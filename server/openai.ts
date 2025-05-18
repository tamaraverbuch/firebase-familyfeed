
import FormData from 'form-data';
import { createReadStream } from 'fs';
import { Readable } from 'stream';

export async function transcribeAudio(audioFilePath: string, language?: string): Promise<string> {
  if (!process.env.OPENAI_API_KEY) {
    throw new Error("OPENAI_API_KEY is not set. Please add it to your environment variables.");
  }

 
  const formData = new FormData();
  formData.append("model", "whisper-1");
  
  // directly append the file stream to form-data 
  formData.append("file", createReadStream(audioFilePath), {
    filename: audioFilePath.split('/').pop() || 'audio.mp3'
  });
  
  if (language) {
    formData.append("language", language);
  }
  
  try {
    const response = await fetch("https://api.openai.com/v1/audio/transcriptions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${process.env.OPENAI_API_KEY}`,
        ...formData.getHeaders()
      },
      // @ts-ignore 
      body: formData,
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`OpenAI API error: ${response.status} - ${errorText}`);
    }

    const result = await response.json();
    return result.text;
  } catch (error) {
    console.error("Error transcribing audio:", error);
    throw new Error(`Failed to transcribe audio: ${error instanceof Error ? error.message : String(error)}`);
  }
}

export async function transcribeAudioFromBuffer(audioBuffer: Buffer, filename: string, language?: string): Promise<string> {
  if (!process.env.OPENAI_API_KEY) {
    throw new Error("OPENAI_API_KEY is not set. Please add it to your environment variables.");
  }

 
  const formData = new FormData();
  formData.append("model", "whisper-1");
  
  // create a readable stream from the buffer
  const bufferStream = new Readable();
  bufferStream.push(audioBuffer);
  bufferStream.push(null); // mark the end of the stream
  
  // append the buffer stream as a file
  formData.append("file", bufferStream, { filename });
  
  if (language) {
    formData.append("language", language);
  }
  
  try {
    const response = await fetch("https://api.openai.com/v1/audio/transcriptions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${process.env.OPENAI_API_KEY}`,
        ...formData.getHeaders()
      },
      // @ts-ignore - FormData is compatible with fetch body but TypeScript doesn't know
      body: formData,
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`OpenAI API error: ${response.status} - ${errorText}`);
    }

    const result = await response.json();
    return result.text;
  } catch (error) {
    console.error("Error transcribing audio:", error);
    throw new Error(`Failed to transcribe audio: ${error instanceof Error ? error.message : String(error)}`);
  }
}