import axios from 'axios'

export async function generateWithStability(
  prompt: string,
  apiKey: string,
  width: number = 512,
  height: number = 512
): Promise<Buffer> {
  const resp = await axios.post(
    'https://api.stability.ai/v1/generation/stable-diffusion-v1-5/text-to-image',
    {
      text_prompts: [{ text: prompt, weight: 1 }],
      cfg_scale: 7,
      clip_guidance_preset: 'NONE',
      height,
      width,
      samples: 1,
      steps: 30,
      style_preset: 'photographic',
    },
    {
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
      },
    }
  )

  const base64data = resp.data.artifacts[0].base64 as string
  return Buffer.from(base64data, 'base64')
}
