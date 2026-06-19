import { NextRequest, NextResponse } from 'next/server'
import ZAI from 'z-ai-web-dev-sdk'

// Cache for translations to avoid repeated API calls
const translationCache = new Map<string, string>()

export async function POST(request: NextRequest) {
  try {
    const { texts, targetLang } = await request.json()
    
    if (!texts || !Array.isArray(texts)) {
      return NextResponse.json({ error: 'texts array is required' }, { status: 400 })
    }

    if (targetLang === 'en') {
      // Return original texts for English
      return NextResponse.json({ translations: texts })
    }

    // Filter out already cached translations
    const uncachedTexts: string[] = []
    const uncachedIndices: number[] = []
    const translations: string[] = new Array(texts.length)
    
    texts.forEach((text, index) => {
      const cacheKey = `${targetLang}:${text}`
      if (translationCache.has(cacheKey)) {
        translations[index] = translationCache.get(cacheKey)!
      } else if (text && text.trim()) {
        uncachedTexts.push(text)
        uncachedIndices.push(index)
      } else {
        translations[index] = text || ''
      }
    })

    // Translate uncached texts
    if (uncachedTexts.length > 0) {
      const zai = await ZAI.create()
      
      // Batch translate all uncached texts at once
      const prompt = `Translate the following texts to Arabic. Return ONLY a JSON array of translated strings in the same order. Do not include any other text or explanation.

Texts to translate:
${JSON.stringify(uncachedTexts)}

Return format: ["translated1", "translated2", ...]`

      const completion = await zai.chat.completions.create({
        messages: [
          {
            role: 'assistant',
            content: 'You are a professional translator. Translate text accurately and naturally. Always return valid JSON arrays.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        thinking: { type: 'disabled' }
      })

      const response = completion.choices[0]?.message?.content || ''
      
      // Parse the JSON response
      let translatedTexts: string[] = []
      try {
        // Extract JSON array from response
        const jsonMatch = response.match(/\[[\s\S]*\]/)
        if (jsonMatch) {
          translatedTexts = JSON.parse(jsonMatch[0])
        }
      } catch {
        // If parsing fails, use original texts
        translatedTexts = uncachedTexts
      }

      // Cache and assign translations
      uncachedIndices.forEach((originalIndex, i) => {
        const translated = translatedTexts[i] || uncachedTexts[i]
        translations[originalIndex] = translated
        const cacheKey = `${targetLang}:${texts[originalIndex]}`
        translationCache.set(cacheKey, translated)
      })
    }

    return NextResponse.json({ translations })
  } catch (error) {
    console.error('Translation error:', error)
    return NextResponse.json({ 
      error: 'Translation failed',
      translations: [] 
    }, { status: 500 })
  }
}
