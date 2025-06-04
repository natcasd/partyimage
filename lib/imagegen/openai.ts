import axios from 'axios'
import { downloadImageBuffer } from '@/lib/imagegen/download'

export async function generateWithOpenAI(
  prompt: string,
  apiKey: string,
  width: number = 1024,
  height: number = 1024
): Promise<Buffer> {
  const size = `${width}x${height}`

  const response = await axios.post(
    'https://api.openai.com/v1/images/generations',
    {
      prompt,
      n: 1,
      size,
      response_format: 'url',
    },
    {
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
    }
  )

  const tempUrl = response.data.data[0].url as string
  if (!tempUrl) {
    throw new Error('OpenAI returned no image URL')
  }

  const buffer = await downloadImageBuffer(tempUrl)
  return buffer
}
