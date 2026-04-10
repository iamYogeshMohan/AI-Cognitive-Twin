import { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Send, Mic, MicOff, Globe, Volume2, VolumeX, Heart, User, Sparkles, ChevronDown, 
  Trash2, AlertCircle
} from 'lucide-react'
import Header from '../components/Header'
import { addToConversationHistory, getConversationHistory } from '../services/memory'
import ReactMarkdown from 'react-markdown'
import './Chat.css'

let msgId = Date.now()

const LANGUAGES = [
  { code: 'en-US', label: 'English', native: 'English' },
  { code: 'ta-IN', label: 'Tamil', native: 'தமிழ்' },
  { code: 'te-IN', label: 'Telugu', native: 'తెలుగు' },
  { code: 'kn-IN', label: 'Kannada', native: 'ಕನ್ನಡ' },
  { code: 'hi-IN', label: 'Hindi', native: 'हिन्दी' },
  { code: 'es-ES', label: 'Spanish', native: 'Español' },
  { code: 'fr-FR', label: 'French', native: 'Français' },
]

const UI_TEXT = {
  'en-US': { switch: 'Switch Identity', personal: '+ Personal', legacy: '+ Legacy', mentality: '+ Mentality', placeholder: 'Message your twin...', listening: 'Listening', muted: 'Muted', disclaimer: 'Neural Reflection: This twin simulates your logic for reflection only. It cannot make real-world decisions on your behalf.' },
  'es-ES': { switch: 'Cambiar Identidad', personal: '+ Personal', legacy: '+ Legado', mentality: '+ Mentalidad', placeholder: 'Envíe un mensaje...', listening: 'Escuchando', muted: 'Silenciado', disclaimer: 'Reflejo Neuronal: Este gemelo simula tu lógica solo para reflexión. No puede tomar decisiones reales por ti.' },
  'fr-FR': { switch: 'Changer d\'identité', personal: '+ Personnel', legacy: '+ Héritage', mentality: '+ Mentalité', placeholder: 'Envoyer un message...', listening: 'Écute', muted: 'Sourdine', disclaimer: 'Réflexion Neuronale : Ce jumeau simule votre logique pour réflexion uniquement. Il ne peut pas prendre de décisions réelles.' },
  'hi-IN': { switch: 'पहचान बदलें', personal: '+ व्यक्तिगत', legacy: '+ विरासत', mentality: '+ मानसिकता', placeholder: 'संदेश भेजें...', listening: 'सुन रहा है', muted: 'मूक', disclaimer: 'न्यूरल प्रतिबिंब: यह ट्विन केवल प्रतिबिंब के लिए आपके तर्क का अनुकरण करता है। यह आपकी ओर से निर्णय नहीं ले सकता।' },
  'ta-IN': { switch: 'அடையாளத்தை மாற்றவும்', personal: '+ தனிப்பட்ட', legacy: '+ பாரம்பரியம்', mentality: '+ மனநிலை', placeholder: 'செய்தி அனுப்பவும்...', listening: 'கேட்கிறது', muted: 'முடக்கப்பட்டது', disclaimer: 'நிபந்தனை: இந்தத் தோழன் உங்கள் சிந்தனைகளின் பிரதிபலிப்பு மட்டுமே; உங்களுக்காக எந்த முடிவையும் எடுக்க முடியாது.' },
  'te-IN': { switch: 'గుర్తింపును మార్చండి', personal: '+ వ్యక్తిగత', legacy: '+ వారసత్వం', mentality: '+ మనస్తత్వం', placeholder: 'మీ జంటకు సందేశం పంపండి...', listening: 'వింటున్నాను', muted: 'మౌనం', disclaimer: 'డిస్క్లైమర్: ఈ ప్రతిబింబం మీ ఆలోచనల ప్రతిరూపం మాత్రమే; ఇది మీ తరపున నిర్ణయాలు తీసుకోదు.' },
  'kn-IN': { switch: 'ಗುರುತನ್ನು ಬದಲಿಸಿ', personal: '+ ವೈಯಕ್ತಿಕ', legacy: '+ ಪರಂಪರೆ', mentality: '+ ಮನಸ್ಥಿತಿ', placeholder: 'ನಿಮ್ಮ ಅವಳಿಗಳಿಗೆ ಸಂದೇಶ ಕಳುಹಿಸಿ...', listening: 'ಕೇಳುತ್ತಿದೆ', muted: 'ಮೌನ', disclaimer: 'ಹಕ್ಕುತ್ಯಾಗ: ಈ ಪ್ರತಿಬಿಂಬವು ನಿಮ್ಮ ಆಲೋಚನೆಗಳ ಪ್ರತಿರೂಪ ಮಾತ್ರ; ಇದು ನಿಮ್ಮ ಪರವಾಗಿ ನಿರ್ಧಾರಗಳನ್ನು ತೆಗೆದುಕೊಳ್ಳುವುದಿಲ್ಲ.' },
}

const PREBUILT_QUESTIONS = [
  { label: '🧠 How do I think?',       text: 'Give me a detailed analysis of how I think — my strengths, biases, and cognitive style.' },
  { label: '🎯 My blind spots?',        text: 'What are my biggest cognitive blind spots or recurring reasoning mistakes?' },
  { label: '🔮 Predict my decision',    text: 'If I were faced with a major career risk right now, how would I likely decide? Show me the logic.' },
  { label: '🧩 Mental models',         text: 'What are the top 3 mental models I use instinctively?' },
]

export default function Chat() {
  const [messages, setMessages] = useState([])
  const [input, setInput]               = useState('')
  const [thinking, setThinking]         = useState(false)
  const [error, setError]               = useState(null)
  const [isListening, setIsListening]   = useState(false)
  const [voiceEnabled, setVoiceEnabled] = useState(false)
  const [selectedLang, setSelectedLang] = useState(() => localStorage.getItem('ct_lang') || 'en-US')
  const [dropdownOpen, setDropdownOpen] = useState(false)

  const bottomRef       = useRef(null)
  const recognitionRef  = useRef(null)
  
  const ui = UI_TEXT[selectedLang] || UI_TEXT['en-US'];

  // Multi-twin management
  const [activeTwinId, setActiveTwinId] = useState(() => {
    const u = JSON.parse(localStorage.getItem('ct_user') || '{}');
    return u.activeTwinId || 'default';
  });

  const [twins, setTwins] = useState(() => {
    return JSON.parse(localStorage.getItem('ct_twins') || '[]');
  });

  const activeTwin = twins.find(t => t.id === activeTwinId) || (twins.length > 0 ? twins[0] : null);

  useEffect(() => {
    localStorage.setItem('ct_lang', selectedLang);
    // Restart recognition if active
    if (recognitionRef.current) recognitionRef.current.lang = selectedLang;
  }, [selectedLang]);

  useEffect(() => {
    if (activeTwin) {
      const history = getConversationHistory(activeTwin.id);
      if (history.length > 0) {
        setMessages(history.map((m, i) => ({ id: `h-${i}`, ...m, timestamp: new Date() })));
      } else {
        setMessages([{
          id: 1,
          role: 'twin',
          text: `Connection established. I am the Cognitive Twin of ${activeTwin.name}. Ready to brainstorm or reflect.`,
          timestamp: new Date(),
        }]);
      }
    }
  }, [activeTwinId]);

  useEffect(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition
    if (!SpeechRecognition) return
    const r = new SpeechRecognition()
    r.continuous      = false
    r.interimResults  = false
    r.lang            = selectedLang
    r.onresult = (e) => {
      const transcript = e.results[0][0].transcript
      setInput(prev => prev ? `${prev} ${transcript}` : transcript)
    }
    r.onend   = () => setIsListening(false)
    r.onerror = () => setIsListening(false)
    recognitionRef.current = r
  }, [selectedLang])

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, thinking])

  const toggleVoice = () => {
    const r = recognitionRef.current
    if (!r) { alert('Speech recognition not supported.'); return }
    if (isListening) { r.stop(); setIsListening(false) }
    else             { r.start(); setIsListening(true) }
  }

  const speakText = async (text) => {
    if (!voiceEnabled) return
    const elKey = localStorage.getItem('elevenlabs-api-key')
    const voiceId = activeTwin?.voiceId || '21m00Tcm4TlvDq8ikWAM'

    // 1. Try ElevenLabs if Key exists
    if (elKey) {
      try {
        const response = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${voiceId}`, {
          method: 'POST',
          headers: { 'xi-api-key': elKey, 'Content-Type': 'application/json' },
          body: JSON.stringify({
            text: text.replace(/[*#]/g, ''),
            model_id: 'eleven_multilingual_v2',
          })
        });
        if (!response.ok) throw new Error('TTS error');
        const blob = await response.blob()
        const url = URL.createObjectURL(blob)
        new Audio(url).play()
        return;
      } catch (err) { console.error('Cloud TTS failed, trying local...'); }
    }

    // 2. Try LOCAL Python Server (FREE Way)
    try {
       const res = await fetch('http://localhost:5000/clone', {
         method: 'POST',
         headers: { 'Content-Type': 'application/json' },
         body: JSON.stringify({
           text: text,
           language: selectedLang.split('-')[0],
           twin_id: activeTwin.id // Match the uploaded sample
         })
       });
       if (res.ok) {
         const blob = await res.blob();
         const url = URL.createObjectURL(blob);
         new Audio(url).play();
         return;
       }
    } catch (err) {
      console.warn('Local Voice Server not running.');
    }

    // 3. Fallback to Native Browser Voice
    nativeSpeak(text)
  }

  const nativeSpeak = (text) => {
    window.speechSynthesis.cancel()
    const utterance = new SpeechSynthesisUtterance(text.replace(/[*#]/g, ''))
    utterance.lang = selectedLang
    window.speechSynthesis.speak(utterance)
  }

  const sendMessage = async () => {
    if (!activeTwin) return;
    const text = input.trim()
    if (!text || thinking) return

    setError(null)
    const userMsg = { id: msgId++, role: 'user', text, timestamp: new Date() }
    setMessages(prev => [...prev, userMsg])
    setInput('')
    setThinking(true)
    addToConversationHistory(activeTwin.id, { role: 'user', text })

    const groqKey = localStorage.getItem('groq-api-key') || ''

    try {
      const languageName = LANGUAGES.find(l => l.code === selectedLang)?.label || 'English';
      let systemInstruction = `YOU MUST RESPOND ONLY IN ${languageName.toUpperCase()}. You are a Cognitive Twin of ${activeTwin.name}. Mode: ${activeTwin.cloningMode}. Context: ${activeTwin.aboutMe}. Traits: ${JSON.stringify(activeTwin.answers)}`;
      
      const res = await fetch('https://api.groq.com/openai/v1/chat/completions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${groqKey}` },
        body: JSON.stringify({
          model: 'llama-3.3-70b-versatile',
          messages: [{ role: 'system', content: systemInstruction }, { role: 'user', content: text }],
          temperature: 0.7
        })
      });

      if (!res.ok) throw new Error("Thinking failed.");
      const data = await res.json()
      const responseText = data.choices?.[0]?.message?.content || "..."
      
      const twinMsg = { id: msgId++, role: 'twin', text: responseText, timestamp: new Date() }
      setMessages(prev => [...prev, twinMsg])
      addToConversationHistory(activeTwin.id, { role: 'twin', text: responseText })
      if (voiceEnabled) speakText(responseText)
    } catch (err) { setError(err.message) }
    finally { setThinking(false) }
  }

  const createNewPersona = (mode) => {
    const u = JSON.parse(localStorage.getItem('ct_user') || '{}');
    u.onboardingCompleted = false;
    u.forcedMode = mode;
    localStorage.setItem('ct_user', JSON.stringify(u));
    window.location.reload();
  }

  const handleTwinSwitch = (id) => {
    setActiveTwinId(id);
    const u = JSON.parse(localStorage.getItem('ct_user') || '{}');
    u.activeTwinId = id;
    localStorage.setItem('ct_user', JSON.stringify(u));
    setDropdownOpen(false);
  }

  return (
    <div className="page chat-page">
      <Header 
        title={activeTwin ? `${activeTwin.name} Twin` : "Chat Twin"} 
        subtitle={activeTwin ? `Perspective: ${activeTwin.cloningMode}` : "Select a persona to begin"} 
      />

      <div className="chat-toolbar">
            <div className="language-selector">
              <Sparkles size={16} />
              <select 
                value={selectedLang} 
                onChange={(e) => setSelectedLang(e.target.value)}
                className="lang-select-premium"
              >
                {LANGUAGES.map(lang => (
                  <option key={lang.code} value={lang.code}>
                    {lang.native} ({lang.label})
                  </option>
                ))}
              </select>
            </div>
        
        <div className="toolbar-divider" />
        
        <div className="persona-hub">
          <button className="hub-btn self" onClick={() => createNewPersona('self')}>
            <User size={14} /> <span>{ui.personal}</span>
          </button>
          <button className="hub-btn loved" onClick={() => createNewPersona('loved_one')}>
            <Heart size={14} /> <span>{ui.legacy}</span>
          </button>
          <button className="hub-btn mentality" onClick={() => createNewPersona('mentality')}>
            <Sparkles size={14} /> <span>{ui.mentality}</span>
          </button>

          {twins.length > 0 && (
            <div className={`twin-history-dropdown ${dropdownOpen ? 'open' : ''}`}>
              <div className="dropdown-trigger" onClick={() => setDropdownOpen(!dropdownOpen)}>
                 <ChevronDown size={14} className={dropdownOpen ? 'rotate' : ''} /> <span>{ui.switch}</span>
              </div>
              <AnimatePresence>
                {dropdownOpen && (
                  <motion.div initial={{opacity:0, y:10}} animate={{opacity:1, y:0}} exit={{opacity:0, y:10}} className="dropdown-menu">
                    {twins.map(t => (
                      <div key={t.id} className={`twin-item ${t.id === activeTwinId ? 'active' : ''}`} onClick={() => handleTwinSwitch(t.id)}>
                        {t.cloningMode === 'loved_one' ? <Heart size={12} /> : t.cloningMode === 'mentality' ? <Sparkles size={12} /> : <User size={12} />}
                        <span>{t.name}</span>
                      </div>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          )}
        </div>

        <div className="toolbar-spacer" />
        
        <button 
          className={`voice-action-btn ${voiceEnabled ? 'active' : ''}`}
          onClick={() => setVoiceEnabled(!voiceEnabled)}
        >
          {voiceEnabled ? <Volume2 size={16} /> : <VolumeX size={16} />}
          <span>{voiceEnabled ? ui.listening : ui.muted}</span>
        </button>
      </div>

      <div className="chat-interface-wrapper">
        <main className="chat-content">
        <div className="messages-container">
            <div className="prebuilt-bar">
              {PREBUILT_QUESTIONS.map((q) => (
                <button key={q.label} className="prebuilt-chip" onClick={() => setInput(q.text)} disabled={thinking}>
                  {q.label}
                </button>
              ))}
            </div>

            <AnimatePresence initial={false}>
              {messages.map((msg) => (
                <motion.div key={msg.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className={`message ${msg.role}`}>
                  <div className="message-bubble">
                    {msg.role === 'twin' ? <div className="markdown-body"><ReactMarkdown>{msg.text}</ReactMarkdown></div> : <p>{msg.text}</p>}
                  </div>
                </motion.div>
              ))}
              {thinking && (
                <div className="message twin"><div className="message-bubble thinking"><div className="thinking-dots"><span /><span /><span /></div></div></div>
              )}
            </AnimatePresence>
            <div ref={bottomRef} />
          </div>

          <div className="chat-input-row">
            <div className="chat-input-wrapper">
              <button className={`mic-btn ${isListening ? 'listening' : ''}`} onClick={toggleVoice}>
                {isListening ? <MicOff size={20} /> : <Mic size={20} />}
              </button>
              <textarea placeholder={ui.placeholder} value={input} onChange={e => setInput(e.target.value)} onKeyDown={(e) => {if(e.key === 'Enter' && !e.shiftKey){e.preventDefault(); sendMessage();}}} rows="1" />
              <button className="send-btn" onClick={sendMessage} disabled={!input.trim() || thinking}>
                <Send size={20} />
              </button>
            </div>
          </div>
        </main>
        
        <footer className="neural-footer">
          <span>{ui.disclaimer}</span>
        </footer>
      </div>
      {error && <div className="chat-error-toast"><AlertCircle size={14} /> {error}</div>}
    </div>
  )
}
