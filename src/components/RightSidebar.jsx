import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Heart, User, Sparkles, ChevronRight, PlusCircle, 
  Home, MessageCircle, Brain, BarChart3, Settings, Cpu, GitBranch, Rocket 
} from 'lucide-react'
import './RightSidebar.css'

export default function RightSidebar() {
  const [activeTwinId, setActiveTwinId] = useState(null)
  const [twins, setTwins] = useState([])

  useEffect(() => {
    const handleSync = () => {
      const u = JSON.parse(localStorage.getItem('ct_user') || '{}');
      const t = JSON.parse(localStorage.getItem('ct_twins') || '[]');
      setTwins(t);
      setActiveTwinId(u.activeTwinId || (t.length > 0 ? t[0].id : null));
    };

    handleSync();
    window.addEventListener('storage', handleSync);
    const interval = setInterval(handleSync, 2000);
    return () => {
      window.removeEventListener('storage', handleSync);
      clearInterval(interval);
    }
  }, []);

  const activeTwin = twins.find(t => t.id === activeTwinId);

  const handleTwinSwitch = (id) => {
    setActiveTwinId(id);
    const u = JSON.parse(localStorage.getItem('ct_user') || '{}');
    u.activeTwinId = id;
    localStorage.setItem('ct_user', JSON.stringify(u));
  }

  const createNewPersona = (mode) => {
    const u = JSON.parse(localStorage.getItem('ct_user') || '{}');
    u.onboardingCompleted = false;
    u.forcedMode = mode;
    localStorage.setItem('ct_user', JSON.stringify(u));
    window.location.href = '/chat'; 
  }

  if (twins.length === 0) return null;

  return (
    <aside className="chat-right-sidebar">
      <div className="sidebar-logo right-logo">
        <div className="logo-orb">
          <Cpu size={20} />
        </div>
        <div className="logo-text">
          <span className="logo-name">Neural Context</span>
          <span className="logo-tag">Active Hub</span>
        </div>
      </div>

      <div className="right-nav-shortcuts">
         <p className="section-label">Neural Shortcuts</p>
         <div className="shortcut-grid">
            <a href="/"          className="s-item" title="Dashboard"><Home size={18} /></a>
            <a href="/chat"      className="s-item" title="Chat Twin"><MessageCircle size={18} /></a>
            <a href="/memory"    className="s-item" title="Memory"><Brain size={18} /></a>
            <a href="/knowledge" className="s-item" title="Knowledge Graph"><GitBranch size={18} /></a>
            <a href="/insights"  className="s-item" title="Insights"><BarChart3 size={18} /></a>
            <a href="/settings"  className="s-item" title="Settings"><Settings size={18} /></a>
            <a href="/features"  className="s-item" title="Features"><Rocket size={18} /></a>
         </div>
      </div>

      {activeTwin && (
        <div className="identity-card-permanent">
           <div className="card-top">
              <div className="id-icon">
                 {activeTwin.cloningMode === 'loved_one' ? <Heart size={20} fill="#ef4444" color="#ef4444" /> : activeTwin.cloningMode === 'mentality' ? <Sparkles size={20} color="#7c3aed" /> : <User size={20} color="#7c3aed" />}
              </div>
              <div className="id-names">
                 <h4>{activeTwin.name}</h4>
                 <span>{activeTwin.cloningMode.toUpperCase()}</span>
              </div>
           </div>

           <div className="id-resonance">
              <div className="res-header">
                 <span>NEURAL SYNC</span>
                 <strong>98.2%</strong>
              </div>
              <div className="res-track"><div className="res-fill" style={{width:'98%'}} /></div>
           </div>

           <div className="id-history-section">
              <p className="section-label">Identity Hub</p>
              <div className="twin-list-mini">
                {twins.map(t => (
                  <button key={t.id} className={`mini-twin-item ${t.id === activeTwinId ? 'active' : ''}`} onClick={() => handleTwinSwitch(t.id)}>
                    <div className="mini-orb">
                       {t.cloningMode === 'loved_one' ? <Heart size={10} /> : t.cloningMode === 'mentality' ? <Sparkles size={10} /> : <User size={10} />}
                    </div>
                    <span>{t.name}</span>
                    <ChevronRight size={14} className="mini-nav-arrow" />
                  </button>
                ))}
              </div>
           </div>

           <button className="create-new-hub-btn" onClick={() => createNewPersona('self')}>
              <PlusCircle size={14} /> <span>Initialize New Twin</span>
           </button>
        </div>
      )}
    </aside>
  )
}
