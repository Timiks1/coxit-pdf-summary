import OpenAI from 'openai'
import type { ChatCompletion } from 'openai/resources'

export const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY })

export const getContent = (response: ChatCompletion) => response.choices[0].message.content! 
