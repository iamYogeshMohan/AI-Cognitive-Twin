import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Brain, Plus, Search, Tag, Clock, Lock, Unlock, Trash2, Star, BookOpen, X, Check } from 'lucide-react'
import Header from '../components/Header'
import { getAllMemories, addMemory, deleteMemory, updateMemory } from '../services/memory'
import './Memory.css'

const CATEGORIES = ['All', 'Technical', 'Personal', 'Legacy', 'Mentality']

const catColors = {
  Technical: 'var(--primary)',
  Personal:  'var(--accent-2)',
  Legacy:    '#ef4444',
  Mentality: '#7c3aed',
}

function AddMemoryModal({ onClose, onAdd }) {
  const [form, setForm] = useState({ title: '', category: 'Technical', content: '', tags: '' })
  const set = (k, v) => setForm(f => ({ ...f, [k]: v }))

  const handleSubmit = () => {
    if (!form.title.trim() || !form.content.trim()) return
    onAdd({
      title: form.title.trim(),
      category: form.category,
      content: form.content.trim(),
      tags: form.tags.split(',').map(t => t.trim()).filter(Boolean),
    })
    onClose()
  }

  return (
    <motion.div
      className="modal-overlay"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={onClose}
    >
      <motion.div
        className="modal-box"
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        onClick={e => e.stopPropagation()}
      >
        <div className="modal-header">
          <h3>Add Memory</h3>
          <button className="modal-close" onClick={onClose}><X size={16} /></button>
        </div>

        <div className="modal-body">
          <div className="form-group">
            <label>Title *</label>
            <input
              placeholder="What is this memory about?"
              value={form.title}
              onChange={e => set('title', e.target.value)}
            />
          </div>
          <div className="form-group">
            <label>Category</label>
            <select value={form.category} onChange={e => set('category', e.target.value)} className="modal-select">
              {CATEGORIES.filter(c => c !== 'All').map(c => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>
          <div className="form-group">
            <label>Content *</label>
            <textarea
              rows={4}
              placeholder="Describe this memory in detail..."
              value={form.content}
              onChange={e => set('content', e.target.value)}
            />
          </div>
          <div className="form-group">
            <label>Tags (comma-separated)</label>
            <input
              placeholder="e.g. Python, ML, Design"
              value={form.tags}
              onChange={e => set('tags', e.target.value)}
            />
          </div>
        </div>

        <div className="modal-footer">
          <button className="btn-outline-modal" onClick={onClose}>Cancel</button>
          <button
            className="btn-primary-modal"
            onClick={handleSubmit}
            disabled={!form.title.trim() || !form.content.trim()}
          >
            <Plus size={14} /> Add Memory
          </button>
        </div>
      </motion.div>
    </motion.div>
  )
}

export default function Memory() {
  const [filter, setFilter] = useState('All')
  const [search, setSearch] = useState('')
  const [memories, setMemories] = useState(getAllMemories)
  const [showModal, setShowModal] = useState(false)
  const [toast, setToast] = useState(null)

  const showToast = (msg) => {
    setToast(msg)
    setTimeout(() => setToast(null), 2500)
  }

  const visible = memories.filter(m =>
    (filter === 'All' || m.category === filter) &&
    (m.title.toLowerCase().includes(search.toLowerCase()) ||
     m.content.toLowerCase().includes(search.toLowerCase()))
  )

  const toggleStar = id => {
    setMemories(ms => ms.map(m => m.id === id ? { ...m, starred: !m.starred } : m))
    updateMemory(id, { starred: !memories.find(m => m.id === id)?.starred })
  }

  const toggleLock = id => {
    setMemories(ms => ms.map(m => m.id === id ? { ...m, locked: !m.locked } : m))
    updateMemory(id, { locked: !memories.find(m => m.id === id)?.locked })
  }

  const handleDelete = (id, title) => {
    if (!window.confirm(`Delete "${title}"? This cannot be undone.`)) return
    deleteMemory(id)
    setMemories(ms => ms.filter(m => m.id !== id))
    showToast('Memory deleted')
  }

  const handleAdd = (data) => {
    const newMem = addMemory(data)
    if (newMem) {
      setMemories(ms => [newMem, ...ms])
      showToast('Memory added!')
    }
  }

  return (
    <div className="page">
      <Header title="Memory Bank" subtitle={`${memories.length} memories — your cognitive knowledge base`} />

      {/* Toast */}
      <AnimatePresence>
        {toast && (
          <motion.div
            className="mem-toast"
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
          >
            <Check size={14} /> {toast}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Add Memory Modal */}
      <AnimatePresence>
        {showModal && <AddMemoryModal onClose={() => setShowModal(false)} onAdd={handleAdd} />}
      </AnimatePresence>

      <div className="memory-body">
        {/* Toolbar */}
        <div className="memory-toolbar">
          <div className="mem-search">
            <Search size={14} />
            <input
              placeholder="Search memories..."
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
          </div>
          <div className="mem-filters">
            {CATEGORIES.map(cat => (
              <button
                key={cat}
                className={`filter-btn ${filter === cat ? 'active' : ''}`}
                onClick={() => setFilter(cat)}
              >
                {cat}
              </button>
            ))}
          </div>
          <button className="add-mem-btn" onClick={() => setShowModal(true)}>
            <Plus size={14} /> Add Memory
          </button>
        </div>

        {/* Stats */}
        <div className="mem-stats">
          <div className="mem-stat">
            <Brain size={18} style={{ color: 'var(--primary)' }} />
            <span className="stat-n">{memories.length}</span>
            <span className="stat-l">Total</span>
          </div>
          <div className="mem-stat">
            <Star size={18} style={{ color: 'var(--warning)' }} />
            <span className="stat-n">{memories.filter(m => m.starred).length}</span>
            <span className="stat-l">Starred</span>
          </div>
          <div className="mem-stat">
            <Lock size={18} style={{ color: 'var(--accent)' }} />
            <span className="stat-n">{memories.filter(m => m.locked).length}</span>
            <span className="stat-l">Private</span>
          </div>
          <div className="mem-stat">
            <BookOpen size={18} style={{ color: 'var(--accent-2)' }} />
            <span className="stat-n">{[...new Set(memories.map(m => m.category))].length}</span>
            <span className="stat-l">Categories</span>
          </div>
        </div>

        {/* Cards */}
        <div className="mem-grid">
          {visible.length === 0 && (
            <div className="mem-empty">
              <Brain size={32} style={{ color: 'var(--text-dim)', marginBottom: 10 }} />
              <p>No memories found. Try a different filter or add a new memory.</p>
            </div>
          )}
          {visible.map((m, i) => (
            <motion.div
              key={m.id}
              className="mem-card"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.06 }}
            >
              <div className="mem-card-header">
                <span
                  className="mem-category"
                  style={{ color: catColors[m.category], background: `${catColors[m.category]}18`, borderColor: `${catColors[m.category]}30` }}
                >
                  {m.category}
                </span>
                <div className="mem-card-actions">
                  <button className={`icon-action ${m.starred ? 'starred' : ''}`} onClick={() => toggleStar(m.id)} title="Star">
                    <Star size={13} />
                  </button>
                  <button className="icon-action" onClick={() => toggleLock(m.id)} title={m.locked ? 'Unlock' : 'Lock'}>
                    {m.locked ? <Lock size={13} /> : <Unlock size={13} />}
                  </button>
                  <button className="icon-action danger" title="Delete" onClick={() => handleDelete(m.id, m.title)}>
                    <Trash2 size={13} />
                  </button>
                </div>
              </div>

              <h3 className="mem-title">{m.title}</h3>
              <p className="mem-content">{m.locked ? '• • • • • • • • • • • • • • • •' : m.content}</p>

              <div className="mem-tags">
                {m.tags.map(t => (
                  <span key={t} className="tag"><Tag size={9} /> {t}</span>
                ))}
              </div>

              <div className="mem-footer">
                <Clock size={11} /> <span>{m.time}</span>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  )
}
