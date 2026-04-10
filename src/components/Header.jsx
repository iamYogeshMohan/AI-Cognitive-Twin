import { Bell, Search, Wifi } from 'lucide-react'
import './Header.css'

export default function Header({ title, subtitle }) {
  return (
    <header className="header">
      <div className="header-left">
        <h1 className="header-title">{title}</h1>
        {subtitle && <p className="header-subtitle">{subtitle}</p>}
      </div>
      <div className="header-right">
        <div className="header-search">
          <Search size={14} />
          <input placeholder="Search anything..." />
        </div>
        <div className="header-icon-btn" title="Connection status">
          <Wifi size={16} />
          <span className="icon-badge" />
        </div>
        <div className="header-icon-btn" title="Notifications">
          <Bell size={16} />
          <span className="icon-badge notify" />
        </div>
        <div className="header-avatar">{JSON.parse(localStorage.getItem('ct_user') || '{}').name?.[0]?.toUpperCase() || 'U'}</div>
      </div>
    </header>
  )
}
