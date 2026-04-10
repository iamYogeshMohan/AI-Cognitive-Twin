import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Rocket, Target, Zap, ChevronRight, Loader2, Sparkles } from 'lucide-react'
import Header from '../components/Header'
import ReactMarkdown from 'react-markdown'
import './Features.css'

export default function Features() {
  const defaultFeatures = [
    {
      id: 4,
      key: 'decision-shadow',
      title: 'Decision Shadow',
      subtitle: 'Predict your next move',
      icon: '🔮',
      description: 'Feed a dilemma or scenario and receive a prediction of how your cognitive twin would reason through it, step by step.',
    },
    {
      id: 5,
      key: 'blind-spot',
      title: 'Blind Spot Detector',
      subtitle: 'Know your cognitive gaps',
      icon: '🎯',
      description: 'Analyses your patterns to surface hidden biases, overconfidence areas, and logical gaps you consistently miss.',
    },
    {
      id: 6,
      key: 'twin-to-twin',
      title: 'Twin-to-Twin Simulation',
      subtitle: 'Simulate reality before living it',
      icon: '👥',
      description: 'Feed two different cognitive profiles and a scenario. Watch how their conversation, debate, or collaboration would unfold before it happens.',
    },
    {
      id: 7,
      key: 'persona-clones',
      title: 'Titan Clones',
      subtitle: 'Consult with legendary minds',
      icon: '🏛️',
      description: 'Interact with high-fidelity cognitive clones of legendary leaders, scientists, and visionaries. Bounce ideas off Elon Musk, Steve Jobs, Dr. APJ Abdul Kalam, and more.',
    },
    {
      id: 8,
      key: 'cognitive-will',
      title: 'Cognitive Will',
      subtitle: 'A sacred legacy',
      icon: '📜',
      description: 'Deliberately record your most important mental models, life lessons, and values. Packaged as a permanent legacy document your twin carries forever.',
    },
    {
      id: 9,
      key: 'collective-intelligence',
      title: 'Collective Intelligence',
      subtitle: 'Group mind simulation',
      icon: '🌐',
      description: 'Combine cognitive twins from a team to identify collective blind spots, unified reasoning outputs, and organizational thinking patterns.',
    },
  ];

  const [featuresList, setFeaturesList] = useState(defaultFeatures)
  const [activeFeature, setActiveFeature] = useState(null)
  
  const [prompt, setPrompt] = useState('')
  const [result, setResult] = useState('')
  const [loading, setLoading] = useState(false)
  
  const [selectedPersona, setSelectedPersona] = useState(null)
  
  // Twin-to-Twin specifically
  const [profileA, setProfileA] = useState('')
  const [profileB, setProfileB] = useState('')
  const [simScenario, setSimScenario] = useState('')

  // Collective Intelligence Swarm
  const [swarmAgents, setSwarmAgents] = useState([{ name: 'Lead Agent', profile: 'Analytical, strategic leader.' }])
  const [swarmMission, setSwarmMission] = useState('')

  const CELEBRITIES = [
    { id: 'elon', name: 'Elon Musk', role: 'Visionary & Engineer', img: 'https://images.weserv.nl/?url=https://upload.wikimedia.org/wikipedia/commons/3/34/Elon_Musk_Royal_Society_%28crop2%29.jpg' },
    { id: 'jobs', name: 'Steve Jobs', role: 'Design Pioneer', img: 'https://images.weserv.nl/?url=https://upload.wikimedia.org/wikipedia/commons/d/dc/Steve_Jobs_Headshot_2010-CROP_%28cropped_2%29.jpg' },
    { id: 'kalam', name: 'Dr. APJ Abdul Kalam', role: 'Scientist & Leader', img: 'https://images.weserv.nl/?url=https://upload.wikimedia.org/wikipedia/commons/b/bd/A.P.J._Abdul_Kalam_2008.jpg' },
    { id: 'sundar', name: 'Sundar Pichai', role: 'Tech Executive', img: 'https://images.weserv.nl/?url=https://upload.wikimedia.org/wikipedia/commons/d/d6/Sundar_Pichai_%282023%29_cropped.jpg' },
    { id: 'dhoni', name: 'MS Dhoni', role: 'Master Tactician', img: 'https://images.weserv.nl/?url=https://upload.wikimedia.org/wikipedia/commons/1/15/MS_Dhoni_%28A_F%C3%AAnix_da_%C3%8Dndia%29.jpg' },
    { id: 'jackma', name: 'Jack Ma', role: 'E-commerce Titan', img: 'https://images.weserv.nl/?url=https://upload.wikimedia.org/wikipedia/commons/e/e0/Jack_Ma_2008.jpg' },
    { id: 'lee', name: 'Bruce Lee', role: 'Martial Arts Philosopher', img: 'https://images.weserv.nl/?url=https://upload.wikimedia.org/wikipedia/commons/c/ca/Bruce_Lee_1973.jpg' },
    { id: 'sivan', name: 'Dr. K. Sivan', role: 'Space Scientist', img: 'https://images.weserv.nl/?url=https://upload.wikimedia.org/wikipedia/commons/3/36/K._Sivan.jpg' },
    { id: 'annadurai', name: 'Mayilsamy Annadurai (MA)', role: 'Moon Man of India', img: 'https://images.weserv.nl/?url=https://upload.wikimedia.org/wikipedia/commons/thumb/a/ae/Mylswamy_Annadurai.jpg/800px-Mylswamy_Annadurai.jpg' },
    { id: 'dk', name: 'Dinesh Karthik (DK)', role: 'Finisher & Analyst', img: 'https://img.etimg.com/thumb/msid-93946286,width-640,resizemode-4,imgsize-34568/dinesh-karthik.jpg' },
    { id: 'kesavan', name: 'Dr. Kesavan', role: 'Visionary Leader', img: 'https://ui-avatars.com/api/?name=Dr+Kesavan&background=7c3aed&color=fff&size=128' },
  ]

  const token = localStorage.getItem('ct_token')
  const apiKey = localStorage.getItem('anthropic-api-key') || ''

  useEffect(() => {
    // Features are now hardcoded in defaultFeatures
  }, [token])

  const executeFeature = async (featureKey) => {
    let finalPrompt = prompt;
    if (featureKey === 'twin-to-twin') {
      if (!profileA.trim() || !profileB.trim() || !simScenario.trim()) {
        setResult("Error: Please define both profiles and the scenario.");
        return;
      }
      finalPrompt = `Profile A: ${profileA}\nProfile B: ${profileB}\nScenario: ${simScenario}`;
    } else if (featureKey === 'collective-intelligence') {
      if (swarmAgents.length === 0 || !swarmMission.trim()) {
        setResult("Error: Please add team members and define the mission.");
        return;
      }
      const agentsStr = swarmAgents.map((a, i) => `Agent ${i+1} (${a.name}): ${a.profile}`).join('\n');
      finalPrompt = `TEAM COMPOSITION:\n${agentsStr}\n\nCOLLECTIVE MISSION:\n${swarmMission}`;
    }

    if (!finalPrompt.trim()) return;
    setLoading(true);
    setResult('');
    
    let systemInstruction = "";
    if (featureKey === 'decision-shadow') {
      systemInstruction = "You are the Decision Shadow. Analyze the user's dilemma based on their cognitive twin profile. Provide a precise prediction on how they would reason through it, highlighting the most likely outcome based on their known biases, preferences, and logic patterns. Output with clear headers and bullet points.";
    } else if (featureKey === 'blind-spot') {
      systemInstruction = "You are the Blind Spot Detector. Carefully scrutinize the user's statement or logic. Ruthlessly but constructively point out hidden cognitive biases, missing logical links, overconfidence, or perspective gaps they are exhibiting. Output a structured report.";
    } else if (featureKey === 'twin-to-twin') {
      systemInstruction = "You are the Twin-to-Twin Simulator. Simulate a multi-turn conversation or debate between two distinct cognitive profiles provided by the user. Construct a dialogue script showing exactly how they would interact based on the given scenario.";
    } else if (featureKey === 'visualization') {
      systemInstruction = "You are the Cognitive Map. Based on the user's personality traits and writing style, generate a detailed report about their thinking dimensions (Analytical, Creative, etc.) and list their most likely top 10 mental models. Output as a clean report.";
    } else if (featureKey === 'cognitive-will') {
      systemInstruction = "You are the Keeper of the Sacred Will. Record the user's legacy lessons and values. Acknowledge them with extreme gravity and confirm how these are now hard-coded into your permanent digital heritage. Summarize the legacy document.";
    } else if (featureKey === 'collective-intelligence') {
      systemInstruction = "You are the Collective Intelligence Mode. Synthesize hypothetical cognitive twins from a team. Analyze the collective blind spots, unified reasoning, and potential triumphs/struggles of the group mind. Perform a high-level organizational audit.";
    } else if (featureKey === 'persona-clones') {
      if (!selectedPersona) {
        setResult("Error: Please select a Titan Clone first!");
        setLoading(false);
        return;
      }
      systemInstruction = `You are a high-fidelity cognitive clone of ${selectedPersona.name}. Answer the prompt entirely from their perspective, utilizing their specific mental models, known vocabulary, catchphrases, philosophical outlook, and intellectual depth. Stay fully in character.`;
    }

    const groqKey = localStorage.getItem('groq-api-key') || '';
    const geminiKey = localStorage.getItem('gemini-api-key') || '';

    try {
      // 1. PRIMARY: Try Groq (Llama 3.3)
      try {
        const res = await fetch('https://api.groq.com/openai/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${groqKey}`
          },
          body: JSON.stringify({
            model: 'llama-3.3-70b-versatile',
            messages: [
              { role: 'system', content: systemInstruction },
              { role: 'user', content: finalPrompt }
            ],
            temperature: 0.7,
            max_tokens: 2048
          })
        });

        if (!res.ok) {
          const raw = await res.text();
          let errText = raw;
          try { errText = JSON.parse(raw).error?.message || raw } catch(e) {}
          throw new Error(errText);
        }

        const data = await res.json();
        setResult(data.choices?.[0]?.message?.content || 'No response calculated.');
        return; // Success

      } catch (groqErr) {
        console.warn("Groq failed, attempting Gemini fallback...", groqErr);
        if (!geminiKey) throw groqErr; // No fallback available
        
        // 2. FALLBACK: Try Gemini 1.5 Flash
        const genAIUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${geminiKey}`;
        const geminiRes = await fetch(genAIUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents: [{
              parts: [{ text: `${systemInstruction}\n\nUSER PROMPT: ${finalPrompt}` }]
            }]
          })
        });

        if (!geminiRes.ok) {
          const raw = await geminiRes.text();
          let errText = raw;
          try { errText = JSON.parse(raw).error?.message || raw } catch(e) {}
          throw new Error(`Groq failed (${groqErr.message}) AND Gemini failed (${errText})`);
        }

        const gData = await geminiRes.json();
        const text = gData.candidates?.[0]?.content?.parts?.[0]?.text;
        setResult(text || 'No response from fallback engine.');
      }
      
    } catch (err) {
      setResult(`*ENGINE ERROR:* ${err.message}. Please check your API keys in Settings.`);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="page features-page">
      <Header title="Advanced Features" subtitle="Deploy specialized cognitive tools" />
      
      <div className="features-container">
        <div className="features-sidebar">
          <h2 className="section-title">Available Modules</h2>
          <div className="features-list">
            {featuresList.map(feature => (
              <motion.button 
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                key={feature.id} 
                className={`feature-card ${activeFeature?.id === feature.id ? 'active' : ''}`}
                onClick={() => { setActiveFeature(feature); setResult(''); setPrompt(''); }}
              >
                <div className="feature-icon">{feature.icon}</div>
                <div className="feature-meta">
                  <h3>{feature.title}</h3>
                  <p>{feature.subtitle}</p>
                </div>
                <ChevronRight size={18} className="feature-arrow" />
              </motion.button>
            ))}
          </div>
        </div>

        <div className="feature-workspace">
          {activeFeature ? (
            <AnimatePresence mode="wait">
              <motion.div 
                key={activeFeature.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="workspace-inner"
              >
                <div className="workspace-header">
                  <h1>{activeFeature.icon} {activeFeature.title}</h1>
                  <p>{activeFeature.description}</p>
                </div>
                
                <div className="workspace-input">
                  {activeFeature.key === 'cognitive-will' ? (
                    <div className="will-workspace" style={{ padding: '10px' }}>
                      <div style={{ background: 'linear-gradient(135deg, #1e1b4b, #312e81)', color: '#fff', padding: 32, borderRadius: 20, marginBottom: 24, boxShadow: '0 10px 30px rgba(0,0,0,0.2)' }}>
                         <h2 style={{ fontSize: 24, marginBottom: 12, fontWeight: 800 }}>The Sacred Protocol</h2>
                         <p style={{ opacity: 0.8, fontSize: 15 }}>Enter the core values and decision frameworks you want your twin to carry as a permanent legacy. This information becomes an immutable part of your digital double.</p>
                      </div>
                      <div className="sim-field">
                        <label style={{display: 'block', fontSize: 12, fontWeight: 700, marginBottom: 8, color: 'var(--primary)'}}>LEGACY INSTRUCTION / VALUE SYSTEM</label>
                        <textarea 
                          placeholder="e.g. Always prioritize long-term skin-in-the-game over short-term profit. If I am gone, teach my children that..."
                          value={prompt}
                          onChange={e => setPrompt(e.target.value)}
                          rows={8}
                        />
                      </div>
                    </div>
                  ) : activeFeature.key === 'collective-intelligence' ? (
                    <div className="collective-workspace" style={{ padding: '10px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 24 }}>
                         <div style={{ padding: 12, background: 'rgba(37, 99, 235, 0.1)', color: 'var(--primary)', borderRadius: 12 }}><div style={{ fontSize: 24 }}>🌐</div></div>
                         <div>
                            <h4 style={{ fontWeight: 700 }}>Swarm Configurator</h4>
                            <p style={{ fontSize: 13, color: 'var(--text-secondary)' }}>Define your team agents and their distinct personas.</p>
                         </div>
                      </div>

                      <div className="agents-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '24px' }}>
                        {swarmAgents.map((agent, idx) => (
                          <div key={idx} className="agent-entry" style={{ background: 'var(--bg)', border: '1px solid var(--border)', padding: '16px', borderRadius: '16px' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px' }}>
                               <span style={{ fontSize: 11, fontWeight: 800, color: 'var(--primary)' }}>AGENT #{idx + 1}</span>
                               {swarmAgents.length > 1 && (
                                 <button onClick={() => setSwarmAgents(swarmAgents.filter((_, i) => i !== idx))} style={{ color: 'var(--danger)', fontSize: 12, fontWeight: 700 }}>REMOVE</button>
                               )}
                            </div>
                            <input 
                              type="text" 
                              placeholder="Agent Name (e.g. Lead Dev)"
                              value={agent.name}
                              onChange={e => {
                                const newA = [...swarmAgents];
                                newA[idx].name = e.target.value;
                                setSwarmAgents(newA);
                              }}
                              style={{ width: '100%', marginBottom: '8px', padding: '8px', borderRadius: '8px', border: '1px solid var(--border)', fontSize: '14px' }}
                            />
                            <textarea 
                              placeholder="Persona Description..."
                              value={agent.profile}
                              onChange={e => {
                                const newA = [...swarmAgents];
                                newA[idx].profile = e.target.value;
                                setSwarmAgents(newA);
                              }}
                              rows={2}
                              style={{ width: '100%', padding: '8px', borderRadius: '8px', border: '1px solid var(--border)', fontSize: '13px' }}
                            />
                          </div>
                        ))}
                        {swarmAgents.length < 10 && (
                          <button 
                            onClick={() => setSwarmAgents([...swarmAgents, { name: '', profile: '' }])}
                            style={{ border: '2px dashed var(--border)', borderRadius: '16px', color: 'var(--text-secondary)', fontWeight: 600, fontSize: 14 }}
                          >
                            + Add Team Member
                          </button>
                        )}
                      </div>

                      <div className="sim-field">
                        <label style={{display: 'block', fontSize: 12, fontWeight: 700, marginBottom: 8, color: 'var(--primary)'}}>THE COLLECTIVE MISSION</label>
                        <textarea 
                          placeholder="What high-stakes problem is this swarm solving?"
                          value={swarmMission}
                          onChange={e => setSwarmMission(e.target.value)}
                          rows={4}
                        />
                      </div>
                    </div>
                  ) : activeFeature.key === 'twin-to-twin' ? (
                    <div className="sim-configurator" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '10px' }}>
                      <div className="sim-field">
                        <label style={{display: 'block', fontSize: 12, fontWeight: 700, marginBottom: 8, color: 'var(--primary)'}}>PROFILE A (DEBATER 1)</label>
                        <textarea 
                          placeholder="E.g., High risk-taker, visionary CEO..."
                          value={profileA}
                          onChange={e => setProfileA(e.target.value)}
                          rows={3}
                          className="sim-textarea"
                        />
                      </div>
                      <div className="sim-field">
                        <label style={{display: 'block', fontSize: 12, fontWeight: 700, marginBottom: 8, color: 'var(--primary)'}}>PROFILE B (DEBATER 2)</label>
                        <textarea 
                          placeholder="E.g., Cautious, analytical CFO..."
                          value={profileB}
                          onChange={e => setProfileB(e.target.value)}
                          rows={3}
                          className="sim-textarea"
                        />
                      </div>
                      <div className="sim-field" style={{ gridColumn: 'span 2' }}>
                        <label style={{display: 'block', fontSize: 12, fontWeight: 700, marginBottom: 8, color: 'var(--primary)'}}>THE SCENARIO / CONFLICT</label>
                        <textarea 
                          placeholder="E.g., The company is facing a funding crisis. Should we pivot or stay the course?"
                          value={simScenario}
                          onChange={e => setSimScenario(e.target.value)}
                          rows={3}
                          className="sim-textarea"
                        />
                      </div>
                    </div>
                  ) : (
                    <>
                      {activeFeature.key === 'persona-clones' && (
                        <div className="personas-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(80px, 1fr))', gap: '12px', marginBottom: '16px' }}>
                          {CELEBRITIES.map(c => (
                            <div 
                              key={c.id} 
                              className={`persona-avatar ${selectedPersona?.id === c.id ? 'selected' : ''}`}
                              onClick={() => setSelectedPersona(c)}
                              style={{
                                display: 'flex', flexDirection: 'column', alignItems: 'center', cursor: 'pointer',
                                opacity: selectedPersona?.id === c.id ? 1 : 0.7,
                                transition: 'all 0.2s', width: '90px'
                              }}
                            >
                              <div style={{
                                width: 64, height: 64, borderRadius: '50%', overflow: 'hidden',
                                border: selectedPersona?.id === c.id ? '3px solid var(--primary)' : '2px solid var(--border)',
                                background: 'var(--bg-secondary)', marginBottom: 8, display: 'flex', alignItems: 'center', justifyContent: 'center',
                                boxShadow: selectedPersona?.id === c.id ? '0 0 15px rgba(124, 58, 237, 0.3)' : 'none'
                              }}>
                                <img 
                                  src={c.img} 
                                  alt="" 
                                  onError={(e) => {
                                    e.target.style.display = 'none';
                                    e.target.nextSibling.style.display = 'flex';
                                  }}
                                  style={{ width: '100%', height: '100%', objectFit: 'cover' }} 
                                />
                                <div className="persona-fallback" style={{ display: 'none', width: '100%', height: '100%', alignItems: 'center', justifyContent: 'center', background: 'var(--primary)', color: '#fff', fontSize: 20, fontWeight: 700 }}>
                                  {c.name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase()}
                                </div>
                              </div>
                              <span style={{ fontSize: 11, textAlign: 'center', fontWeight: 600, color: 'var(--text-primary)', lineHeight: 1.2, height: '28px' }}>{c.name}</span>
                            </div>
                          ))}
                        </div>
                      )}
                      
                      <textarea 
                        placeholder={activeFeature.key === 'persona-clones' ? `Ask ${selectedPersona ? selectedPersona.name : 'this Titan'} for advice...` : activeFeature.inputPlaceholder}
                        value={prompt}
                        onChange={e => setPrompt(e.target.value)}
                        rows={6}
                      />
                    </>
                  )}
                  <button 
                    className="execute-btn primary-btn" 
                    onClick={() => executeFeature(activeFeature.key)}
                    disabled={loading || (activeFeature.key !== 'visualization' && !prompt.trim()) || (activeFeature.key === 'persona-clones' && !selectedPersona)}
                  >
                    {loading ? <><Loader2 className="spin" size={18} /> Processing...</> : <><Sparkles size={18} /> Execute Module</>}
                  </button>
                </div>

                {result && (
                  <motion.div 
                    initial={{ opacity: 0, scale: 0.98 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="workspace-result active"
                  >
                    <div className="markdown-body">
                      <ReactMarkdown>{result}</ReactMarkdown>
                    </div>
                  </motion.div>
                )}
              </motion.div>
            </AnimatePresence>
          ) : (
            <div className="empty-workspace">
              <Rocket size={48} className="empty-icon" />
              <h2>Select a Module</h2>
              <p>Choose an advanced cognitive feature from the left sidebar to initialize the engine.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
