/**
 * Memory Management System
 * Handles storing, retrieving, and evolving Yogesh's memories
 */

const MEMORY_STORAGE_KEY = 'yogesh-memories'
const CONVERSATION_HISTORY_KEY = 'yogesh-conversation-history'
const MEMORY_CONTEXT_KEY = 'yogesh-memory-context'

/**
 * Initialize default memories
 */
const DEFAULT_MEMORIES = [
  {
    id: 1,
    title: 'System Architecture Patterns',
    category: 'Technical',
    content: 'Preference for microservices with event-driven communication. Favors clean architecture with clear separation of concerns.',
    tags: ['Architecture', 'Backend'],
    time: new Date(Date.now() - 2 * 60 * 60 * 1000).toLocaleString(),
    starred: true,
    locked: false,
    source: 'initial'
  },
  {
    id: 2,
    title: 'Design Philosophy',
    category: 'Creative',
    content: 'Strong affinity for minimalist aesthetics with functional depth. Dislikes over-engineered UI. Values user experience above all.',
    tags: ['Design', 'UX'],
    time: new Date(Date.now() - 24 * 60 * 60 * 1000).toLocaleString(),
    starred: false,
    locked: false,
    source: 'initial'
  },
  {
    id: 3,
    title: 'Learning Goals 2025',
    category: 'Personal',
    content: 'Master Rust and WebAssembly. Deep dive into quantum computing fundamentals. Build AI-assisted development tools.',
    tags: ['Goals', 'Learning'],
    time: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toLocaleString(),
    starred: true,
    locked: true,
    source: 'initial'
  },
  {
    id: 4,
    title: 'Problem-Solving Approach',
    category: 'Cognitive',
    content: 'Tends to break problems into first principles. Uses rubber duck debugging effectively. Works best in focused 90-minute blocks.',
    tags: ['Productivity', 'Methods'],
    time: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toLocaleString(),
    starred: false,
    locked: false,
    source: 'initial'
  }
]

/**
 * Get all memories from storage
 * @returns {array} Array of memory objects
 */
export function getAllMemories() {
  try {
    const stored = localStorage.getItem(MEMORY_STORAGE_KEY)
    if (!stored) {
      // Initialize with default memories
      localStorage.setItem(MEMORY_STORAGE_KEY, JSON.stringify(DEFAULT_MEMORIES))
      return DEFAULT_MEMORIES
    }
    return JSON.parse(stored)
  } catch (error) {
    console.error('Error loading memories:', error)
    return DEFAULT_MEMORIES
  }
}

/**
 * Get memories as context string for Claude
 * @param {number} limit - Max number of memories to include
 * @returns {string} Formatted memory context
 */
export function getMemoryContext(limit = 10) {
  try {
    const memories = getAllMemories()
    const topMemories = memories.slice(0, limit)
    
    let context = 'Known about Yogesh:\n\n'
    
    // Group by category
    const grouped = {}
    topMemories.forEach(m => {
      if (!grouped[m.category]) grouped[m.category] = []
      grouped[m.category].push(m)
    })
    
    Object.entries(grouped).forEach(([category, mems]) => {
      context += `**${category}:**\n`
      mems.forEach(m => {
        context += `- ${m.title}: ${m.content.substring(0, 100)}...\n`
      })
      context += '\n'
    })
    
    return context
  } catch (error) {
    console.error('Error getting memory context:', error)
    return ''
  }
}

/**
 * Add a new memory
 * @param {object} memory - Memory object
 * @returns {object} Added memory with ID and timestamp
 */
export function addMemory(memory) {
  try {
    const memories = getAllMemories()
    const newMemory = {
      id: Math.max(...memories.map(m => m.id), 0) + 1,
      time: new Date().toLocaleString(),
      starred: false,
      locked: false,
      source: 'conversation',
      ...memory
    }
    
    memories.unshift(newMemory)
    localStorage.setItem(MEMORY_STORAGE_KEY, JSON.stringify(memories))
    return newMemory
  } catch (error) {
    console.error('Error adding memory:', error)
    return null
  }
}

/**
 * Update an existing memory
 * @param {number} id - Memory ID
 * @param {object} updates - Fields to update
 * @returns {object} Updated memory or null
 */
export function updateMemory(id, updates) {
  try {
    const memories = getAllMemories()
    const index = memories.findIndex(m => m.id === id)
    
    if (index === -1) return null
    
    memories[index] = { ...memories[index], ...updates }
    localStorage.setItem(MEMORY_STORAGE_KEY, JSON.stringify(memories))
    return memories[index]
  } catch (error) {
    console.error('Error updating memory:', error)
    return null
  }
}

/**
 * Delete a memory
 * @param {number} id - Memory ID
 * @returns {boolean} Success status
 */
export function deleteMemory(id) {
  try {
    const memories = getAllMemories()
    const filtered = memories.filter(m => m.id !== id)
    localStorage.setItem(MEMORY_STORAGE_KEY, JSON.stringify(filtered))
    return true
  } catch (error) {
    console.error('Error deleting memory:', error)
    return false
  }
}

/**
 * Toggle starred status
 * @param {number} id - Memory ID
 * @returns {object} Updated memory
 */
export function toggleStarred(id) {
  const memory = getAllMemories().find(m => m.id === id)
  if (!memory) return null
  return updateMemory(id, { starred: !memory.starred })
}

/**
 * Toggle locked status
 * @param {number} id - Memory ID
 * @returns {object} Updated memory
 */
export function toggleLocked(id) {
  const memory = getAllMemories().find(m => m.id === id)
  if (!memory) return null
  return updateMemory(id, { locked: !memory.locked })
}

/**
 * Get conversation history for a specific twin
 * @param {string} twinId - The ID of the twin profile
 * @returns {array} Array of message objects
 */
export function getConversationHistory(twinId = 'default') {
  try {
    const key = `${CONVERSATION_HISTORY_KEY}_${twinId}`
    const stored = localStorage.getItem(key)
    return stored ? JSON.parse(stored) : []
  } catch (error) {
    console.error('Error loading conversation history:', error)
    return []
  }
}

/**
 * Add message to conversation history for a specific twin
 * @param {string} twinId - The ID of the twin profile
 * @param {object} message - Message object {role, text, time}
 */
export function addToConversationHistory(twinId, message) {
  if (!twinId) return;
  try {
    const key = `${CONVERSATION_HISTORY_KEY}_${twinId}`
    const history = getConversationHistory(twinId)
    history.push({
      ...message,
      timestamp: Date.now()
    })
    
    if (history.length > 50) {
      history.shift()
    }
    
    localStorage.setItem(key, JSON.stringify(history))
  } catch (error) {
    console.error('Error saving to conversation history:', error)
  }
}

/**
 * Clear conversation history
 */
export function clearConversationHistory() {
  try {
    localStorage.removeItem(CONVERSATION_HISTORY_KEY)
  } catch (error) {
    console.error('Error clearing conversation history:', error)
  }
}

/**
 * Build a comprehensive memory context for Claude
 * Includes starred memories, recent insights, and personality notes
 * @returns {string} Full memory context
 */
export function buildComprehensiveMemoryContext() {
  const memories = getAllMemories()
  
  let context = '## YOGESH\'S ACCUMULATED KNOWLEDGE & PREFERENCES\n\n'
  
  // Starred memories (most important)
  const starred = memories.filter(m => m.starred)
  if (starred.length > 0) {
    context += '### Key Insights (Starred):\n'
    starred.forEach(m => {
      context += `- **${m.title}**: ${m.content}\n`
    })
    context += '\n'
  }
  
  // Recent from each category
  const categories = [...new Set(memories.map(m => m.category))]
  categories.forEach(cat => {
    const catMemories = memories.filter(m => m.category === cat).slice(0, 3)
    if (catMemories.length > 0) {
      context += `### ${cat}:\n`
      catMemories.forEach(m => {
        context += `- ${m.title}: ${m.content}\n`
      })
      context += '\n'
    }
  })
  
  return context
}

/**
 * Search memories
 * @param {string} query - Search query
 * @returns {array} Matching memories
 */
export function searchMemories(query) {
  const memories = getAllMemories()
  const q = query.toLowerCase()
  
  return memories.filter(m =>
    m.title.toLowerCase().includes(q) ||
    m.content.toLowerCase().includes(q) ||
    m.tags.some(t => t.toLowerCase().includes(q))
  )
}

/**
 * Get statistics about memories
 * @returns {object} Memory stats
 */
export function getMemoryStats() {
  const memories = getAllMemories()
  const categories = [...new Set(memories.map(m => m.category))]
  
  return {
    total: memories.length,
    starred: memories.filter(m => m.starred).length,
    locked: memories.filter(m => m.locked).length,
    categories: categories.length,
    byCategory: Object.fromEntries(
      categories.map(cat => [
        cat,
        memories.filter(m => m.category === cat).length
      ])
    )
  }
}
