import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronRight, Brain, Zap, ArrowRight, ShieldCheck, Cpu, Mic, MicOff, Heart, User, Users, Sparkles, PlusCircle, UserPlus, Info, Upload, Music, CheckCircle, AlertCircle } from 'lucide-react';
import './Onboarding.css';

const TOTAL_STEPS_MAP = {
  self: 8,
  loved_one: 8,
  mentality: 4
};

export default function Onboarding({ onComplete }) {
  const [step, setStep] = useState(1);
  const ctUser = JSON.parse(localStorage.getItem('ct_user') || '{}');
  const cloningMode = ctUser.forcedMode || 'self';
  
  const totalSteps = TOTAL_STEPS_MAP[cloningMode] || 8;
  const displayStep = cloningMode === 'mentality' && step === 7 ? 4 : step;

  const [currentTwinId] = useState(`twin_${Date.now()}`);
  const [isRecording, setIsRecording] = useState(false);
  const [recordDuration, setRecordDuration] = useState(0);
  const [voiceProcessing, setVoiceProcessing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [selectedMentality, setSelectedMentality] = useState('');
  const [customMentality, setCustomMentality] = useState('');
  const [voiceFile, setVoiceFile] = useState(null);
  const [voiceId, setVoiceId] = useState('');
  const [mentalityAnswers, setMentalityAnswers] = useState({ principle: '', handling: '', northStar: '' });
  const [aboutMe, setAboutMe] = useState('');
  const [samples, setSamples] = useState([]);
  const [tempSample, setTempSample] = useState('');
  const [consentGiven, setConsentGiven] = useState(false);
  const [relationship, setRelationship] = useState({ name: '', relation: '', purpose: '', status: '' });
  const [answers, setAnswers] = useState({ problemSolving: '', learningStyle: '', decisionMaking: '', creativityLevel: '', workStyle: '' });

  const recognitionRef = useRef(null);
  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef(null);
  const timerRef = useRef(null);

  const exitSetup = () => {
    const u = JSON.parse(localStorage.getItem('ct_user') || '{}');
    delete u.forcedMode;
    u.onboardingCompleted = true;
    localStorage.setItem('ct_user', JSON.stringify(u));
    onComplete();
  };

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const recorder = new MediaRecorder(stream);
      mediaRecorderRef.current = recorder;
      audioChunksRef.current = [];
      
      recorder.ondataavailable = (e) => audioChunksRef.current.push(e.data);
      recorder.onstop = () => {
        const blob = new Blob(audioChunksRef.current, { type: 'audio/wav' });
        const file = new File([blob], 'recording.wav', { type: 'audio/wav' });
        setVoiceFile(file);
        stream.getTracks().forEach(track => track.stop());
      };
      
      recorder.start();
      setIsRecording(true);
      setRecordDuration(0);
      timerRef.current = setInterval(() => setRecordDuration(d => d + 1), 1000);
    } catch (err) { alert("Microphone access denied."); }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current) mediaRecorderRef.current.stop();
    setIsRecording(false);
    clearInterval(timerRef.current);
  };

  const formatDuration = (s) => `${Math.floor(s / 60)}:${(s % 60).toString().padStart(2, '0')}`;

  useEffect(() => {
    const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SR) return;
    const r = new SR();
    r.continuous = false; r.interimResults = false; r.lang = 'en-US';
    r.onresult = (e) => {
      const transcript = e.results[0][0].transcript;
      if (step === 4) setAboutMe(prev => prev ? `${prev} ${transcript}` : transcript);
      if (step === 5) setTempSample(transcript);
    };
    r.onend = () => setIsListening(false);
    r.onerror = () => setIsListening(false);
    recognitionRef.current = r;
  }, [step]);

  const nextStep = () => {
    if (cloningMode === 'mentality') {
      if (step === 3) {
        setStep(7); 
      } else {
        setStep(s => s + 1);
      }
    } else if (step === 6 && voiceFile && !voiceId) {
      handleVoiceClone();
    } else {
      setStep(s => Math.min(s + 1, totalSteps));
    }
  };

  const prevStep = () => {
    if (cloningMode === 'mentality' && step === 7) {
      setStep(3);
    } else {
      setStep(s => Math.max(s - 1, 1));
    }
  };

  const handleVoiceClone = async () => {
    const elKey = localStorage.getItem('elevenlabs-api-key');
    setVoiceProcessing(true);

    if (elKey) {
      try {
        const formData = new FormData();
        formData.append('name', cloningMode === 'self' ? 'My Voice' : relationship.name);
        formData.append('files', voiceFile);
        const res = await fetch('https://api.elevenlabs.io/v1/voices/add', {
          method: 'POST',
          headers: { 'xi-api-key': elKey },
          body: formData
        });
        const data = await res.json();
        if (data.voice_id) setVoiceId(data.voice_id);
        setStep(step + 1);
        return;
      } catch (err) { console.error('Cloud cloning failed'); }
    }

    try {
      const liveFormData = new FormData();
      liveFormData.append('file', voiceFile);
      liveFormData.append('twin_id', currentTwinId);
      const res = await fetch('http://localhost:5000/upload_sample', {
        method: 'POST',
        body: liveFormData
      });
      if (res.ok) {
        setVoiceId('LOCAL_CLONE');
        setStep(step+1);
        return;
      }
    } catch (err) {
      console.warn('Local Server not available.');
    }

    setStep(step + 1);
    setVoiceProcessing(false);
  };

  const handleFinish = async () => {
    setLoading(true);
    const newTwin = {
      id: currentTwinId,
      name: cloningMode === 'mentality' ? (customMentality || selectedMentality) : (cloningMode === 'loved_one' ? relationship.name : 'Personal'),
      cloningMode,
      aboutMe,
      answers,
      samples,
      voiceId,
      createdAt: new Date().toISOString()
    };

    const twins = JSON.parse(localStorage.getItem('ct_twins') || '[]');
    twins.push(newTwin);
    localStorage.setItem('ct_twins', JSON.stringify(twins));

    const u = JSON.parse(localStorage.getItem('ct_user') || '{}');
    u.onboardingCompleted = true;
    u.activeTwinId = newTwin.id;
    delete u.forcedMode;
    localStorage.setItem('ct_user', JSON.stringify(u));
    
    onComplete();
  };

  return (
    <div className="onboarding-bg">
      <div className="onboarding-container">
        <div className="onboard-top-nav">
          <div className="active-mode-indicator">
            {cloningMode === 'self' && <><User size={18}/> <span>Personal Mode</span></>}
            {cloningMode === 'loved_one' && <><Heart size={18}/> <span>Legacy Mode</span></>}
            {cloningMode === 'mentality' && <><Sparkles size={18}/> <span>Expertise Mode</span></>}
          </div>
          <button className="exit-setup-btn" onClick={exitSetup}>
            Exit Setup
          </button>
        </div>

        <div className="progress-system">
          <div className="progress-track">
            {Array.from({length: totalSteps}).map((_, i) => (
              <div key={i} className={`progress-segment ${i + 1 <= displayStep ? 'filled' : ''} ${i + 1 === displayStep ? 'active' : ''}`} />
            ))}
          </div>
          <span className="progress-label">Phase 0{displayStep} of 0{totalSteps}</span>
        </div>

        <div className="step-card">
          <AnimatePresence mode="wait">
            
            {step === 1 && (
               <motion.div key="1" initial={{opacity:0, y:20}} animate={{opacity:1, y:0}} exit={{opacity:0, y:-20}}>
                <div className="step-badge">Initialization</div>
                <h1 className="step-title">Welcome to the Persona Setup</h1>
                <p className="step-body">You are initializing a new digital twin profile. This process will map cognitive traits and linguistic rhythm to ensure a high-fidelity sync.</p>
                <div className="nav-row">
                  <div/>
                  <button className="primary-btn" onClick={nextStep}>Begin Mapping <ArrowRight size={18} /></button>
                </div>
              </motion.div>
            )}

            {step === 2 && (
              <motion.div key="2" initial={{opacity:0, y:20}} animate={{opacity:1, y:0}} exit={{opacity:0, y:-20}}>
                <div className="step-badge">Identity Details</div>
                {cloningMode === 'mentality' ? (
                  <div className="mentality-selection">
                    <h2 className="step-title" style={{fontSize:24}}>Select Field of Expertise</h2>
                    <div className="mentality-grid">
                      {['Business Maven', 'Coding Lead', 'Philosophy Guru', 'Strategic Planner', 'Deep Scientist'].map(m => (
                        <button key={m} className={`mentality-pill ${selectedMentality === m ? 'active' : ''}`} onClick={() => {setSelectedMentality(m); setCustomMentality('');}}>{m}</button>
                      ))}
                    </div>
                    <div className="custom-mentality">
                      <UserPlus size={18} />
                      <input type="text" value={customMentality} onChange={e => {setCustomMentality(e.target.value); setSelectedMentality('');}} placeholder="Or specify expertise name..." className="onboard-input" />
                    </div>
                  </div>
                ) : cloningMode === 'loved_one' ? (
                  <div className="relationship-form">
                    <div className="aesthetic-input-group">
                      <div className="aesthetic-input-wrapper">
                        <User size={18} />
                        <input type="text" value={relationship.name} onChange={e => setRelationship({...relationship, name: e.target.value})} placeholder="Their Full Name" />
                      </div>
                      <div className="aesthetic-input-wrapper">
                        <Users size={18} />
                        <input type="text" value={relationship.relation} onChange={e => setRelationship({...relationship, relation: e.target.value})} placeholder="Relationship (e.g. Mentor)" />
                      </div>
                    </div>
                    <div className="radio-group" style={{margin:'24px 0'}}>
                        <button className={relationship.status === 'alive' ? 'active' : ''} onClick={() => setRelationship({...relationship, status: 'alive'})}>Alive</button>
                        <button className={relationship.status === 'deceased' ? 'active' : ''} onClick={() => setRelationship({...relationship, status: 'deceased'})}>Deceased</button>
                    </div>
                  </div>
                ) : (
                  <div className="consent-block">
                    <p className="step-body">Authorizing a new Personal Clone. This will allow the system to reconstruct your decision patterns in a separate isolated container.</p>
                    <label className="checkbox-container"><input type="checkbox" checked={consentGiven} onChange={e => setConsentGiven(e.target.checked)} /><span className="checkmark"></span>I authorize this initialization.</label>
                  </div>
                )}
                <div className="nav-row"><button className="secondary-btn" onClick={prevStep}>Back</button><button className="primary-btn" onClick={nextStep} disabled={cloningMode==='mentality' ? (!selectedMentality && !customMentality) : (cloningMode==='loved_one' ? !relationship.name : !consentGiven)}>Next Phase</button></div>
              </motion.div>
            )}

            {step === 3 && (
              <motion.div key="3" initial={{opacity:0, y:20}} animate={{opacity:1, y:0}} exit={{opacity:0, y:-20}}>
                <div className="step-badge">{cloningMode === 'mentality' ? 'Mentality Probe' : 'Psychometrics'}</div>
                <h1 className="step-title">{cloningMode === 'mentality' ? 'Inside the Mind' : 'Cognitive Map'}</h1>
                <p className="step-body">{cloningMode === 'mentality' ? 'Architecture the internal logic of this expertise persona.' : 'Select the primary reasoning methodology for this persona.'}</p>
                
                {cloningMode === 'mentality' ? (
                   <div className="mentality-prober">
                      <div className="probe-input">
                         <label>What is the non-negotiable principle that drives this mentality?</label>
                         <div className="aesthetic-input-wrapper">
                            <ShieldCheck size={18} />
                            <input type="text" value={mentalityAnswers.principle} onChange={e => setMentalityAnswers({...mentalityAnswers, principle: e.target.value})} placeholder="e.g., Extreme Ownership, Customer Obsession..." />
                         </div>
                      </div>
                      <div className="probe-input">
                         <label>How does this persona handle conflicting data or high-pressure stakes?</label>
                         <div className="aesthetic-input-wrapper">
                            <Cpu size={18} />
                            <input type="text" value={mentalityAnswers.handling} onChange={e => setMentalityAnswers({...mentalityAnswers, handling: e.target.value})} placeholder="e.g., Rationalizes via First Principles, Decides on Vibe..." />
                         </div>
                      </div>
                      <div className="probe-input">
                         <label>What is the ultimate objective or "North Star" of this frame of mind?</label>
                         <div className="aesthetic-input-wrapper">
                            <Sparkles size={18} />
                            <input type="text" value={mentalityAnswers.northStar} onChange={e => setMentalityAnswers({...mentalityAnswers, northStar: e.target.value})} placeholder="e.g., Efficiency at any cost, Long-term growth..." />
                         </div>
                      </div>
                   </div>
                ) : (
                  <>
                    <div className="reasoning-grid">
                      {[
                        { id: 'analytical', label: 'Analytical', icon: <Zap size={18} />, desc: 'Logic & Data' },
                        { id: 'intuitive', label: 'Intuitive', icon: <Brain size={18} />, desc: 'Pattern-based' },
                        { id: 'skeptic', label: 'Critical', icon: <ShieldCheck size={18} />, desc: 'Deep Skeptic' },
                        { id: 'empathetic', label: 'Empathetic', icon: <Heart size={18} />, desc: 'Emotion-Centric' }
                      ].map(style => (
                        <button key={style.id} className={`reasoning-card ${answers.problemSolving === style.id ? 'active' : ''}`} onClick={() => {setAnswers({...answers, problemSolving: style.id}); setCustomMentality('');}}>
                          <div className="card-icon">{style.icon}</div>
                          <div className="card-info">
                            <strong>{style.label}</strong>
                            <span>{style.desc}</span>
                          </div>
                        </button>
                      ))}
                    </div>
                    
                    <div className="custom-override" style={{marginTop: 20}}>
                       <div className="aesthetic-input-wrapper">
                          <Sparkles size={18} />
                          <input type="text" placeholder="Or define custom reasoning style..." value={answers.problemSolving.startsWith('custom:') ? answers.problemSolving.replace('custom:', '') : ''} onChange={e => setAnswers({...answers, problemSolving: `custom:${e.target.value}`})} />
                       </div>
                    </div>
                  </>
                )}

                <div className="nav-row">
                   <button className="secondary-btn" onClick={prevStep}>Back</button>
                   <button className="primary-btn" onClick={nextStep} disabled={cloningMode === 'mentality' ? (!mentalityAnswers.principle || !mentalityAnswers.northStar) : !answers.problemSolving}>Next Phase</button>
                </div>
              </motion.div>
            )}

            {step === 4 && (
              <motion.div key="4" initial={{opacity:0, y:20}} animate={{opacity:1, y:0}} exit={{opacity:0, y:-20}}>
                <div className="step-badge">Deep Context</div>
                <h1 className="step-title">Biography & Values</h1>
                <textarea value={aboutMe} onChange={e => setAboutMe(e.target.value)} placeholder="Describe values, goals, and core personality traits..." rows={6} className="onboard-textarea" />
                <div className="nav-row"><button className="secondary-btn" onClick={prevStep}>Back</button><button className="primary-btn" onClick={nextStep} disabled={aboutMe.length < 10}>Next Phase</button></div>
              </motion.div>
            )}

            {step === 5 && (
              <motion.div key="5" initial={{opacity:0, y:20}} animate={{opacity:1, y:0}} exit={{opacity:0, y:-20}}>
                <div className="tonality-info">
                   <div className="info-icon"><Info size={20}/></div>
                   <div className="info-text">
                      <strong>What is Tonality?</strong>
                      <p>Tonality is the unique "flavor" of speech. It's not what you say, but how you say it.</p>
                   </div>
                </div>

                <div className="chips-container" style={{minHeight: 60, margin: '20px 0'}}>
                   {samples.map((s, i) => (
                     <motion.div key={i} initial={{scale: 0.8, opacity: 0}} animate={{scale: 1, opacity: 1}} className="aesthetic-chip">
                        <span>{s}</span>
                        <button onClick={()=>setSamples(samples.filter((_, idx)=>idx!==i))}>✕</button>
                     </motion.div>
                   ))}
                   {samples.length === 0 && <p className="chip-placeholder">No phrases added yet...</p>}
                </div>

                <form onSubmit={(e) => {e.preventDefault(); if(tempSample.trim()){setSamples([...samples, tempSample]); setTempSample('');}}} className="aesthetic-adder">
                  <div className="aesthetic-input-wrapper">
                    <Mic size={18} />
                    <input type="text" value={tempSample} onChange={e => setTempSample(e.target.value)} placeholder="Type a signature phrase or slang..." />
                  </div>
                  <button type="submit" className="onboard-add-btn" disabled={!tempSample.trim()}>Add</button>
                </form>
                <div className="nav-row"><button className="secondary-btn" onClick={prevStep}>Back</button><button className="primary-btn" onClick={nextStep} disabled={samples.length < 1}>Next Phase</button></div>
              </motion.div>
            )}

            {step === 6 && (
              <motion.div key="6" initial={{opacity:0, y:20}} animate={{opacity:1, y:0}} exit={{opacity:0, y:-20}}>
                <div className="step-badge">Neural Voice</div>
                <h1 className="step-title">Voice Mapping</h1>
                <p className="step-body">Upload a sample or record your voice live to initialize the neural vocal engine.</p>
                
                {!localStorage.getItem('elevenlabs-api-key') && (
                  <div className="voice-api-warning">
                    <AlertCircle size={16} />
                    <div>
                       <strong>ElevenLabs Not Connected</strong>
                       <p>Cloning is disabled. Voice output will use local neural engine if active. <a href="/settings" style={{color:'inherit', fontWeight: 800}}>Set Key in Settings</a></p>
                    </div>
                  </div>
                )}

                <div className="voice-studio">
                  <div className="voice-method-toggle">
                    <div className="voice-upload-zone">
                      <input type="file" accept="audio/*" onChange={e => setVoiceFile(e.target.files[0])} id="voice-upload" hidden />
                      <label htmlFor="voice-upload" className="audio-upload-card">
                        <Upload size={24} />
                        <strong>{voiceFile?.name || "Upload Audio Sample"}</strong>
                        <span>Drag & drop or browse files</span>
                      </label>
                    </div>

                    <div className="voice-divider"><span>OR</span></div>

                    <div className={`voice-record-card ${isRecording ? 'active' : ''}`}>
                       <div className="record-header">
                         <div className="live-pill">LIVE</div>
                         <span className="timer">{formatDuration(recordDuration)}</span>
                       </div>
                       <button className={`record-trigger ${isRecording ? 'stop' : ''}`} onClick={isRecording ? stopRecording : startRecording}>
                         {isRecording ? <div className="stop-square" /> : <Mic size={24} />}
                       </button>
                       <p>{isRecording ? "Recording your frequencies..." : "Capture live sample"}</p>
                    </div>
                  </div>
                </div>

                <div className="nav-row">
                  <button className="secondary-btn" onClick={prevStep} disabled={voiceProcessing}>Back</button>
                  <button className="primary-btn" onClick={nextStep} disabled={voiceProcessing}>
                    {voiceProcessing ? 'Synthesizing...' : voiceFile ? 'Initialize Voice' : 'Skip for Now'}
                  </button>
                </div>
              </motion.div>
            )}

            {step === 7 && (
              <motion.div key="7" initial={{opacity:0, y:20}} animate={{opacity:1, y:0}} exit={{opacity:0, y:-20}}>
                <div className="step-badge">Finalization</div>
                <h1 className="step-title">Ready to Synthesize</h1>
                <p className="step-body">Verify all details before the neural engine starts the personality reconstruction.</p>
                <div className="nav-row"><button className="secondary-btn" onClick={prevStep}>Back</button><button className="primary-btn" onClick={handleFinish} disabled={loading}>{loading ? 'Synthesizing...' : 'Synthesize Persona'}</button></div>
              </motion.div>
            )}

          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
