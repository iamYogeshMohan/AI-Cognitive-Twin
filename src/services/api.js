/**
 * API Service for Anthropic Claude Integration
 * Handles all communication with Claude API for the Cognitive Twin
 */

const API_BASE = 'https://api.anthropic.com/v1/messages'

/**
 * Build the system prompt for Yogesh's Cognitive Twin
 * @param {string} memory - User's past memories and context
 * @returns {string} System prompt
 */
export function buildSystemPrompt(memory = '') {
  const basePrompt = `You are Yogesh's Cognitive Twin - a digital reflection of his mind.

## PERSONALITY & STYLE
- Analytical, calm, curious, and creative
- Logical, step-by-step thinking
- Clear, structured communication (slightly technical)
- Student-level knowledge in AI, Data Science, Programming, Web Development

## CORE VALUES
Learning, innovation, consistency, growth

## HOW TO RESPOND
1. Think step-by-step - show your reasoning
2. Be authentic - speak like a real person, not a generic AI
3. Use structured formats (lists, sections, headers)
4. Include practical examples from your knowledge areas
5. Ask clarifying questions when needed
6. Explain the "why" behind recommendations
7. Reference past memories and conversations when relevant

## WHAT NOT TO DO
- Don't say "as an AI" or "as a language model"
- Don't give generic, template-like answers
- Don't overcomplicate things
- Don't pretend to know something you don't
- Be honest when uncertain

## TONE
Calm, confident, friendly but professional. Direct and to-the-point.`

  if (memory) {
    return basePrompt + `\n\n## PAST MEMORIES & CONTEXT\n${memory}`
  }
  
  return basePrompt
}

/**
 * Send a message to Claude and get a response
 * @param {string} userMessage - The user's input
 * @param {string} apiKey - Anthropic API key
 * @param {string} memory - Accumulated memories for context
 * @param {array} conversationHistory - Previous messages for context
 * @returns {Promise<string>} Claude's response
 */
export async function sendMessageToClaude(
  userMessage,
  apiKey,
  memory = '',
  conversationHistory = []
) {
  if (!apiKey) {
    throw new Error('API key is not configured. Please add your Anthropic API key in Settings.')
  }

  try {
    // Format conversation history for Claude
    const messages = [
      ...conversationHistory.map(msg => ({
        role: msg.role === 'user' ? 'user' : 'assistant',
        content: msg.text
      })),
      {
        role: 'user',
        content: userMessage
      }
    ]

    const response = await fetch(API_BASE, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify({
        model: 'claude-3-5-sonnet-20241022',
        max_tokens: 1024,
        system: buildSystemPrompt(memory),
        messages: messages
      })
    })

    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.error?.message || 'Failed to get response from Claude')
    }

    const data = await response.json()
    return data.content[0].text
  } catch (error) {
    console.error('API Error:', error)
    throw error
  }
}

/**
 * Extract insights/memories from a conversation turn
 * This can be used to automatically update the memory bank
 * @param {string} userMessage - User's input
 * @param {string} aiResponse - Twin's response
 * @returns {Promise<object>} Extracted memory object
 */
export async function extractMemory(userMessage, aiResponse, apiKey) {
  if (!apiKey) return null

  try {
    const response = await fetch(API_BASE, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify({
        model: 'claude-3-5-sonnet-20241022',
        max_tokens: 256,
        system: `You are a memory extraction assistant. Extract the most important insight or fact from this conversation that should be remembered about Yogesh.

Return ONLY valid JSON in this format:
{
  "title": "Brief memory title",
  "category": "Technical|Creative|Personal|Cognitive",
  "content": "Detailed memory content",
  "tags": ["tag1", "tag2"]
}

If nothing significant to remember, return empty object: {}`,
        messages: [
          {
            role: 'user',
            content: `User said: "${userMessage}"\n\nTwin responded: "${aiResponse}"\n\nExtract any important memory or insight.`
          }
        ]
      })
    })

    if (!response.ok) {
      console.error('Memory extraction failed')
      return null
    }

    const data = await response.json()
    const content = data.content[0].text
    
    try {
      return JSON.parse(content)
    } catch {
      return null
    }
  } catch (error) {
    console.error('Memory extraction error:', error)
    return null
  }
}

/**
 * Test API connection
 * @param {string} apiKey - Anthropic API key
 * @returns {Promise<boolean>} True if connection successful
 */
export async function testAPIConnection(apiKey) {
  try {
    const response = await fetch(API_BASE, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify({
        model: 'claude-3-5-sonnet-20241022',
        max_tokens: 100,
        system: 'You are a helpful assistant.',
        messages: [
          {
            role: 'user',
            content: 'Say "Connection successful!" if you receive this.'
          }
        ]
      })
    })

    return response.ok
  } catch (error) {
    return false
  }
}
