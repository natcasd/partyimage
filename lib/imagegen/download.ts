import axios from 'axios'

export async function downloadImageBuffer(imageUrl: string): Promise<Buffer> {
  const response = await axios.get<ArrayBuffer>(imageUrl, {
    responseType: 'arraybuffer',
  })
  return Buffer.from(response.data)
}
