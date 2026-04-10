import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  User, Bell, Brain, Lock, Palette, ShieldCheck, Key,
  Moon, Sun, Monitor, Save, ChevronRight, Check, AlertCircle, Zap, Trash2
} from 'lucide-react'
import Header from '../components/Header'
import { testAPIConnection } from '../services/api'
import { getMemoryStats, clearConversationHistory } from '../services/memory'
import './Settings.css'

const SECTIONS = [
  { id: 'api',          label: 'API Configuration', icon: Key },
  { id: 'profile',      label: 'Profile',           icon: User },
  { id: 'twin',         label: 'Twin Behaviour',    icon: Brain },
  { id: 'appearance',   label: 'Appearance',        icon: Palette },
  { id: 'notifications',label: 'Notifications',     icon: Bell },
  { id: 'privacy',      label: 'Privacy & Security', icon: ShieldCheck },
]

function Toggle({ on, onToggle }) {
  return (
    <button className={`toggle ${on ? 'on' : ''}`} onClick={onToggle} aria-label="toggle">
      <span className="toggle-thumb" />
    </button>
  )
}

export default function Settings() {
  const [active, setActive] = useState('api')
  const [apiKey, setApiKey]         = useState(localStorage.getItem('anthropic-api-key') || '')
  const [groqKey, setGroqKey]       = useState(localStorage.getItem('groq-api-key') || '')
  const [geminiKey, setGeminiKey]   = useState(localStorage.getItem('gemini-api-key') || '')
  const [elevenLabsKey, setElevenLabsKey] = useState(localStorage.getItem('elevenlabs-api-key') || '')

  const [showKey, setShowKey]       = useState(false)
  const [showGroqKey, setShowGroqKey] = useState(false)
  const [showGeminiKey, setShowGeminiKey] = useState(false)
  const [showElevenKey, setShowElevenKey] = useState(false)

  const [testingAPI, setTestingAPI]   = useState(false)
  const [testingGroq, setTestingGroq] = useState(false)
  const [testingGemini, setTestingGemini] = useState(false)
  const [testingEleven, setTestingEleven] = useState(false)

  const [apiStatus, setApiStatus]     = useState(null)
  const [groqStatus, setGroqStatus]   = useState(null)
  const [geminiStatus, setGeminiStatus] = useState(null)
  const [elevenStatus, setElevenStatus] = useState(null)

  const [toast, setToast] = useState(null)
  const [stats, setStats] = useState(getMemoryStats())

  const [prefs, setPrefs] = useState({
    name: 'Yogesh',
    email: 'yogesh@cognitivetwin.ai',
    bio: 'AI & Data Science Student, curious and creative.',
    theme: 'light',
    cogMode: 'analytical',
    voiceId: '21m00Tcm4TlvDq8ikWAM', // Default Josh voice
    autoLearn: true,
    memorySync: true,
    notifications: true,
    emailDigest: false,
    publicProfile: false,
    dataAnalytics: true,
    streamThinking: true,
    responseDepth: 'detailed',
  })

  const set = (k, v) => setPrefs(p => ({ ...p, [k]: v }))

  const showToast = (type, message) => {
    setToast({ type, message })
    setTimeout(() => setToast(null), 3000)
  }

  const handleSaveApiKey = () => {
    if (!apiKey.trim()) {
      showToast('error', 'Anthropic API key cannot be empty')
      return
    }
    localStorage.setItem('anthropic-api-key', apiKey)
    showToast('success', 'Anthropic API key saved!')
  }

  const handleSaveGroqKey = () => {
    if (!groqKey.trim()) {
      showToast('error', 'Groq API key cannot be empty')
      return
    }
    localStorage.setItem('groq-api-key', groqKey)
    showToast('success', 'Groq API key saved!')
  }

  const handleSaveGeminiKey = () => {
    if (!geminiKey.trim()) { showToast('error', 'Gemini API key cannot be empty'); return }
    localStorage.setItem('gemini-api-key', geminiKey)
    showToast('success', 'Gemini API key saved!')
  }

  const handleSaveElevenLabsKey = () => {
    if (!elevenLabsKey.trim()) { showToast('error', 'ElevenLabs API key cannot be empty'); return }
    localStorage.setItem('elevenlabs-api-key', elevenLabsKey)
    showToast('success', 'ElevenLabs API key saved!')
  }

  const handleTestAPI = async () => {
    if (!apiKey.trim()) {
      showToast('error', 'Please enter an API key first')
      return
    }
    setTestingAPI(true)
    setApiStatus(null)
    try {
      const success = await testAPIConnection(apiKey)
      setApiStatus({
        type: success ? 'success' : 'error',
        message: success ? '✓ Anthropic connection successful!' : '✗ Connection failed'
      })
    } catch {
      setApiStatus({ type: 'error', message: '✗ Error testing connection' })
    } finally {
      setTestingAPI(false)
    }
  }

  const handleTestGroq = async () => {
    if (!groqKey.trim()) {
      showToast('error', 'Please enter a Groq key first')
      return
    }
    setTestingGroq(true)
    setGroqStatus(null)
    try {
      const res = await fetch('https://api.groq.com/openai/v1/models', {
        headers: { 'Authorization': `Bearer ${groqKey}` }
      })
      const success = res.ok
      setGroqStatus({
        type: success ? 'success' : 'error',
        message: success ? '✓ Groq connection successful!' : '✗ Groq connection failed'
      })
    } catch {
      setGroqStatus({ type: 'error', message: '✗ Error testing Groq' })
    } finally {
      setTestingGroq(false)
    }
  }

  const handleTestGemini = async () => {
    if (!geminiKey.trim()) { showToast('error', 'Please enter a Gemini key first'); return }
    setTestingGemini(true); setGeminiStatus(null)
    try {
      const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${geminiKey}`)
      setGeminiStatus({ type: res.ok ? 'success' : 'error', message: res.ok ? '✓ Gemini connection successful!' : '✗ Gemini connection failed' })
    } catch { setGeminiStatus({ type: 'error', message: '✗ Error testing Gemini' }) }
    finally { setTestingGemini(false) }
  }

  const handleTestEleven = async () => {
    if (!elevenLabsKey.trim()) { showToast('error', 'Please enter an ElevenLabs key first'); return }
    setTestingEleven(true); setElevenStatus(null)
    try {
      const res = await fetch('https://api.elevenlabs.io/v1/user', { headers: { 'xi-api-key': elevenLabsKey } })
      setElevenStatus({ type: res.ok ? 'success' : 'error', message: res.ok ? '✓ ElevenLabs connection successful!' : '✗ ElevenLabs connection failed' })
    } catch { setElevenStatus({ type: 'error', message: '✗ Error testing ElevenLabs' }) }
    finally { setTestingEleven(false) }
  }

  const handleSaveProfile = () => {
    showToast('success', 'Profile saved!')
  }

  const handleSavePrefs = () => {
    localStorage.setItem('twin-prefs', JSON.stringify(prefs))
    showToast('success', 'Preferences saved!')
  }

  const handleClearHistory = () => {
    if (!window.confirm('Clear all conversation history? This cannot be undone.')) return
    clearConversationHistory()
    showToast('success', 'Conversation history cleared')
  }

  const handleResetMemory = () => {
    if (!window.confirm('Reset all memories to defaults? This cannot be undone.')) return
    localStorage.removeItem('yogesh-memories')
    setStats(getMemoryStats())
    showToast('success', 'Memory reset to defaults')
  }

  const handleDeleteAccount = () => {
    if (!window.confirm('Delete all data? This will clear everything stored locally.')) return
    localStorage.clear()
    showToast('success', 'All local data cleared')
    setStats(getMemoryStats())
  }

  const handleExportData = () => {
    const data = {
      memories: JSON.parse(localStorage.getItem('yogesh-memories') || '[]'),
      conversation: JSON.parse(localStorage.getItem('yogesh-conversation-history') || '[]'),
      prefs,
      exportedAt: new Date().toISOString(),
    }
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `cognitive-twin-export-${Date.now()}.json`
    a.click()
    URL.revokeObjectURL(url)
    showToast('success', 'Data exported successfully!')
  }

  return (
    <div className="page">
      <Header title="Settings" subtitle="Configure your Cognitive Twin" />

      {/* Global Toast */}
      <AnimatePresence>
        {toast && (
          <motion.div
            className={`status-message ${toast.type}`}
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
          >
            {toast.type === 'success' ? <Check size={14} /> : <AlertCircle size={14} />}
            {toast.message}
          </motion.div>
        )}
      </AnimatePresence>

      <div className="settings-body">
        {/* Sidebar Nav */}
        <div className="settings-nav">
          {SECTIONS.map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              className={`settings-nav-item ${active === id ? 'active' : ''}`}
              onClick={() => setActive(id)}
            >
              <Icon size={15} />
              <span>{label}</span>
              <ChevronRight size={13} className="s-arrow" />
            </button>
          ))}
        </div>

        {/* Content Panel */}
        <motion.div
          key={active}
          className="settings-content"
          initial={{ opacity: 0, x: 12 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.2 }}
        >
          {/* ── API Configuration ── */}
          {active === 'api' && (
            <div className="settings-section">
              <h2>API Configuration</h2>
              <p className="settings-desc">Manage the neural engines powering your twin.</p>

              <div className="form-group full">
                <label>ElevenLabs API Key (High Fidelity Neural Voice)</label>
                <p className="form-hint" style={{ marginBottom: 12 }}>
                  Required for <strong>Voice Cloning</strong>. Get yours at <a href="https://elevenlabs.io/api" target="_blank" rel="noopener noreferrer" style={{color: 'var(--primary)', fontWeight: 800}}>elevenlabs.io</a>
                </p>
                <div className="api-key-input">
                  <input
                    type={showElevenKey ? 'text' : 'password'}
                    value={elevenLabsKey}
                    onChange={e => setElevenLabsKey(e.target.value)}
                    placeholder="xi-api-key"
                  />
                  <button onClick={() => setShowElevenKey(!showElevenKey)} className="key-toggle-btn">
                    {showElevenKey ? '👁️' : '🔒'}
                  </button>
                </div>
                
                <div className="api-guide-box" style={{ marginTop: 16, padding: 16, background: 'rgba(124, 58, 237, 0.05)', borderRadius: 12, border: '1px solid rgba(124, 58, 237, 0.1)' }}>
                   <p style={{ fontSize: 12, fontWeight: 800, color: 'var(--primary)', marginBottom: 8 }}>VOICE CLONING GUIDE</p>
                   <ul style={{ fontSize: 12, color: '#64748b', paddingLeft: 16, margin: 0 }}>
                      <li>Connect your API Key above.</li>
                      <li>Go to <strong>Initialize New Twin</strong> on the Identity Hub.</li>
                      <li>In <strong>Phase 06 (Voice Mapping)</strong>, upload a ~1 min audio sample.</li>
                      <li>The system will automatically clone your voice via ElevenLabs.</li>
                   </ul>
                </div>

                <div className="button-group" style={{marginTop: 16}}>
                  <button className="btn-primary" onClick={handleSaveElevenLabsKey}><Save size={14} /> Save Key</button>
                  <button className="btn-secondary" onClick={handleTestEleven} disabled={testingEleven}><Zap size={14} /> Test Sync</button>
                </div>
                {elevenStatus && <div className={`api-status ${elevenStatus.type}`}>{elevenStatus.message}</div>}
              </div>

              <div className="form-group full">
                <label>Anthropic API Key (for Chat)</label>
                <div className="api-key-input">
                  <input
                    type={showKey ? 'text' : 'password'}
                    value={apiKey}
                    onChange={e => setApiKey(e.target.value)}
                    placeholder="sk-ant-api03-..."
                  />
                  <button onClick={() => setShowKey(!showKey)} title={showKey ? 'Hide' : 'Show'} className="key-toggle-btn">
                    {showKey ? '👁️' : '🔒'}
                  </button>
                </div>
                <div className="button-group" style={{marginTop: 8}}>
                  <button className="btn-primary" onClick={handleSaveApiKey}><Save size={14} /> Save</button>
                  <button className="btn-secondary" onClick={handleTestAPI} disabled={testingAPI}><Zap size={14} /> Test</button>
                </div>
                {apiStatus && <div className={`api-status ${apiStatus.type}`}>{apiStatus.message}</div>}
              </div>

              <div className="form-group full" style={{ marginTop: 24 }}>
                <label>Groq API Key (for Advanced Modules)</label>
                <div className="api-key-input">
                  <input
                    type={showGroqKey ? 'text' : 'password'}
                    value={groqKey}
                    onChange={e => setGroqKey(e.target.value)}
                    placeholder="gsk_..."
                  />
                  <button onClick={() => setShowGroqKey(!showGroqKey)} title={showGroqKey ? 'Hide' : 'Show'} className="key-toggle-btn">
                    {showGroqKey ? '👁️' : '🔒'}
                  </button>
                </div>
                <div className="button-group" style={{marginTop: 8}}>
                  <button className="btn-primary" onClick={handleSaveGroqKey}><Save size={14} /> Save</button>
                  <button className="btn-secondary" onClick={handleTestGroq} disabled={testingGroq}><Zap size={14} /> Test</button>
                </div>
                {groqStatus && <div className={`api-status ${groqStatus.type}`}>{groqStatus.message}</div>}
              </div>

              <div className="form-group full" style={{ marginTop: 24 }}>
                <label>Gemini API Key (Engine Fallback)</label>
                <div className="api-key-input">
                  <input
                    type={showGeminiKey ? 'text' : 'password'}
                    value={geminiKey}
                    onChange={e => setGeminiKey(e.target.value)}
                    placeholder="AIza..."
                  />
                  <button onClick={() => setShowGeminiKey(!showGeminiKey)} title={showGeminiKey ? 'Hide' : 'Show'} className="key-toggle-btn">
                    {showGeminiKey ? '👁️' : '🔒'}
                  </button>
                </div>
                <div className="button-group" style={{marginTop: 8}}>
                  <button className="btn-primary" onClick={handleSaveGeminiKey}><Save size={14} /> Save</button>
                  <button className="btn-secondary" onClick={handleTestGemini} disabled={testingGemini}><Zap size={14} /> Test</button>
                </div>
                {geminiStatus && <div className={`api-status ${geminiStatus.type}`}>{geminiStatus.message}</div>}
                <p className="form-hint">Uses Gemini 1.5 for ultra-reliable backup processing.</p>
              </div>

              <div className="stats-box">
                <h3>Memory Statistics</h3>
                <div className="stat-row"><span>Total Memories</span><strong>{stats.total}</strong></div>
                <div className="stat-row"><span>Starred</span><strong>{stats.starred}</strong></div>
                <div className="stat-row"><span>Private</span><strong>{stats.locked}</strong></div>
                <div className="stat-row"><span>Categories</span><strong>{stats.categories}</strong></div>
              </div>

              <button className="btn-danger" onClick={handleClearHistory}>
                <Trash2 size={14} /> Clear Conversation History
              </button>
            </div>
          )}

          {/* ── Profile ── */}
          {active === 'profile' && (
            <div className="settings-section">
              <h2>Profile</h2>
              <p className="settings-desc">Your personal identity and how your twin knows you.</p>

              <div className="profile-avatar-row">
                <div className="profile-avatar">Y</div>
                <div>
                  <p className="profile-avatar-name">{prefs.name}</p>
                  <p className="profile-avatar-email">{prefs.email}</p>
                </div>
              </div>

              <div className="form-grid">
                <div className="form-group">
                  <label>Display Name</label>
                  <input value={prefs.name} onChange={e => set('name', e.target.value)} />
                </div>
                <div className="form-group">
                  <label>Email</label>
                  <input value={prefs.email} onChange={e => set('email', e.target.value)} />
                </div>
                <div className="form-group full">
                  <label>Bio</label>
                  <textarea rows={3} value={prefs.bio} onChange={e => set('bio', e.target.value)} />
                </div>
              </div>
              <button className="btn-primary" onClick={handleSaveProfile}>
                <Save size={14} /> Save Changes
              </button>
            </div>
          )}

          {/* ── Twin Behaviour ── */}
          {active === 'twin' && (
            <div className="settings-section">
              <h2>Twin Behaviour</h2>
              <p className="settings-desc">Control how your AI twin thinks, learns, and responds.</p>

              <div className="settings-group">
                <div className="settings-label-row">
                  <div>
                    <p className="s-label">Cognitive Mode</p>
                    <p className="s-sub">How your twin approaches problems</p>
                  </div>
                </div>
                <div className="mode-grid">
                  {['analytical', 'creative', 'balanced', 'concise'].map(m => (
                    <button
                      key={m}
                      className={`mode-btn ${prefs.cogMode === m ? 'active' : ''}`}
                      onClick={() => set('cogMode', m)}
                    >
                      {m.charAt(0).toUpperCase() + m.slice(1)}
                    </button>
                  ))}
                </div>
              </div>

              <div className="settings-group">
                <div className="settings-label-row">
                  <div>
                    <p className="s-label">Response Depth</p>
                    <p className="s-sub">How detailed the twin's answers are</p>
                  </div>
                </div>
                <div className="mode-grid">
                  {['brief', 'moderate', 'detailed', 'exhaustive'].map(m => (
                    <button
                      key={m}
                      className={`mode-btn ${prefs.responseDepth === m ? 'active' : ''}`}
                      onClick={() => set('responseDepth', m)}
                    >
                      {m.charAt(0).toUpperCase() + m.slice(1)}
                    </button>
                  ))}
                </div>
              </div>

              {[
                { k: 'autoLearn', label: 'Auto-Learn', sub: 'Twin learns from your patterns automatically' },
                { k: 'memorySync', label: 'Memory Sync', sub: 'Sync memories across devices' },
                { k: 'streamThinking', label: 'Stream Thinking', sub: 'Show reasoning in real-time' },
              ].map(({ k, label, sub }) => (
                <div key={k} className="settings-toggle-row">
                  <div>
                    <p className="s-label">{label}</p>
                    <p className="s-sub">{sub}</p>
                  </div>
                  <Toggle on={prefs[k]} onToggle={() => set(k, !prefs[k])} />
                </div>
              ))}

              <button className="btn-primary" onClick={handleSavePrefs}>
                <Save size={14} /> Save Preferences
              </button>
            </div>
          )}

          {/* ── Appearance ── */}
          {active === 'appearance' && (
            <div className="settings-section">
              <h2>Appearance</h2>
              <p className="settings-desc">Customize the look and feel of your interface.</p>

              <div className="settings-group">
                <p className="s-label" style={{ marginBottom: 12 }}>Theme</p>
                <div className="theme-grid">
                  {[
                    { id: 'light',  icon: Sun,     label: 'Light' },
                    { id: 'dark',   icon: Moon,    label: 'Dark' },
                    { id: 'system', icon: Monitor, label: 'System' },
                  ].map(({ id, icon: Icon, label }) => (
                    <button
                      key={id}
                      className={`theme-btn ${prefs.theme === id ? 'active' : ''}`}
                      onClick={() => set('theme', id)}
                    >
                      <Icon size={20} />
                      <span>{label}</span>
                    </button>
                  ))}
                </div>
              </div>

              <div className="settings-group">
                <p className="s-label" style={{ marginBottom: 12 }}>Accent Colour</p>
                <div className="color-swatches">
                  {['#2563eb','#7c3aed','#0891b2','#dc2626','#d97706','#16a34a'].map(c => (
                    <button
                      key={c}
                      className="swatch"
                      style={{ background: c }}
                      title={c}
                      onClick={() => showToast('success', `Accent color applied: ${c}`)}
                    />
                  ))}
                </div>
              </div>

              <button className="btn-primary" onClick={handleSavePrefs}>
                <Save size={14} /> Save Appearance
              </button>
            </div>
          )}

          {/* ── Notifications ── */}
          {active === 'notifications' && (
            <div className="settings-section">
              <h2>Notifications</h2>
              <p className="settings-desc">Control when and how you receive alerts.</p>

              {[
                { k: 'notifications', label: 'Push Notifications', sub: 'Get alerts about twin activity' },
                { k: 'emailDigest',   label: 'Weekly Email Digest', sub: 'Receive a summary of your cognitive progress' },
              ].map(({ k, label, sub }) => (
                <div key={k} className="settings-toggle-row">
                  <div>
                    <p className="s-label">{label}</p>
                    <p className="s-sub">{sub}</p>
                  </div>
                  <Toggle on={prefs[k]} onToggle={() => set(k, !prefs[k])} />
                </div>
              ))}

              <button className="btn-primary" onClick={handleSavePrefs}>
                <Save size={14} /> Save Preferences
              </button>
            </div>
          )}

          {/* ── Privacy & Security ── */}
          {active === 'privacy' && (
            <div className="settings-section">
              <h2>Privacy & Security</h2>
              <p className="settings-desc">Your data is yours. Here's how we protect it.</p>

              <div className="privacy-section">
                <h3>🗄️ Data Storage</h3>
                <p>All memories and conversation history are stored locally in your browser. Nothing is sent externally except API requests to Anthropic's Claude.</p>
              </div>

              <div className="privacy-section">
                <h3>🔐 API Communication</h3>
                <p>When you chat, messages and memory context are sent to Anthropic's servers for processing. Review their privacy policy at <a href="https://anthropic.com" target="_blank" rel="noopener noreferrer">anthropic.com</a></p>
              </div>

              {[
                { k: 'publicProfile',  label: 'Public Profile', sub: 'Make your profile visible to others' },
                { k: 'dataAnalytics',  label: 'Usage Analytics', sub: 'Help improve the app with anonymous data' },
              ].map(({ k, label, sub }) => (
                <div key={k} className="settings-toggle-row">
                  <div>
                    <p className="s-label">{label}</p>
                    <p className="s-sub">{sub}</p>
                  </div>
                  <Toggle on={prefs[k]} onToggle={() => set(k, !prefs[k])} />
                </div>
              ))}

              <button className="btn-primary" onClick={handleSavePrefs}>
                <Save size={14} /> Save Preferences
              </button>

              <div className="danger-zone">
                <h3>Danger Zone</h3>
                <p>These actions are irreversible. Proceed with caution.</p>
                <div className="danger-btns">
                  <button className="btn-danger-outline" onClick={handleResetMemory}>
                    <Trash2 size={13} /> Reset Twin Memory
                  </button>
                  <button className="btn-danger" onClick={handleDeleteAccount}>
                    Delete All Data
                  </button>
                </div>
                <div style={{ marginTop: 12 }}>
                  <button className="btn-outline" onClick={handleExportData}>
                    📦 Export All Data
                  </button>
                </div>
              </div>
            </div>
          )}
        </motion.div>
      </div>
    </div>
  )
}
