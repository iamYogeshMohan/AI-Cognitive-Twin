import { NavLink } from 'react-router-dom'
import {
  Home, 
  MessageCircle, 
  Brain, 
  BarChart3,
  Settings, 
  Cpu, 
  ChevronRight, 
  Rocket, 
  GitBranch, 
  Unplug, 
  Heart, 
  User 
} from 'lucide-react'
import './Sidebar.css'

const navItems = [
  { to: '/',          icon: Home,            label: 'Dashboard',       end: true },
  { to: '/chat',      icon: MessageCircle,   label: 'Chat Twin'                 },
  { to: '/memory',    icon: Brain,           label: 'Memory'                    },
  { to: '/knowledge', icon: GitBranch,       label: 'Knowledge Graph'           },
  { to: '/insights',  icon: BarChart3,       label: 'Insights'                  },
  { to: '/settings',  icon: Settings,        label: 'Settings'                  },
]

export default function Sidebar({ onLogout }) {
  const ctUser = JSON.parse(localStorage.getItem('ct_user') || '{}');
  
  // Find active twin in local storage to show info
  const twins = JSON.parse(localStorage.getItem('ct_twins') || '[]');
  const activeTwinId = ctUser.activeTwinId || (twins.length > 0 ? twins[0].id : null);
  const activeTwin = twins.find(t => t.id === activeTwinId);

  const isLegacy = activeTwin?.cloningMode === 'loved_one';
  const name = activeTwin?.name || ctUser.name || 'User';

  return (
    <aside className="sidebar">
      {/* Logo */}
      <div className="sidebar-logo">
        <div className="logo-orb">
          <Cpu size={20} />
        </div>
        <div className="logo-text">
          <span className="logo-name">CognitiveTwin</span>
          <span className="logo-tag">AI v2.1</span>
        </div>
      </div>

      {/* Status */}
      <div className="sidebar-resonance">
        <div className="resonance-meta">
          <span>Neural Resonance</span>
          <strong>98.2%</strong>
        </div>
        <div className="resonance-bars">
          {[1, 2, 3, 4, 5, 6].map(i => (
            <div key={i} className="res-bar" style={{ animationDelay: `${i * 0.1}s` }} />
          ))}
        </div>
      </div>

      {/* Nav */}
      <nav className="sidebar-nav">
        <p className="nav-label">Navigation</p>
        <div className="nav-items-container">
          {navItems.map(({ to, icon: Icon, label, end }) => (
            <NavLink
              key={to}
              to={to}
              end={end}
              className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
            >
              <div className="nav-icon-box">
                <Icon size={20} />
              </div>
              <span className="nav-text">{label}</span>
              <ChevronRight size={14} className="nav-arrow" />
            </NavLink>
          ))}
          <NavLink to="/features" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
            <div className="nav-icon-box">
              <Rocket size={20} />
            </div>
            <span className="nav-text">Advanced Modules</span>
            <ChevronRight size={14} className="nav-arrow" />
          </NavLink>
        </div>
      </nav>

      {/* Footer */}
      <div className="sidebar-footer">
        <div className="profile-teaser">
          <div className={`twin-avatar ${isLegacy ? 'legacy' : ''}`}>
             {isLegacy ? <Heart size={16} fill="currentColor" /> : <User size={16} />}
          </div>
          <div className="twin-info">
            <p className="twin-name">{name}</p>
            <p className="twin-mode">{isLegacy ? 'Legacy Clone' : 'Active Sync'}</p>
          </div>
        </div>
        
        <button className="logout-btn" onClick={onLogout}>
          <Unplug size={14} className="logout-icon" />
          <span>Disconnect</span>
        </button>
      </div>
    </aside>
  )
}
