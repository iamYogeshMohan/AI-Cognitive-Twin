import { useState, useEffect } from 'react'
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import Sidebar from './components/Sidebar'
import RightSidebar from './components/RightSidebar'
import Dashboard from './pages/Dashboard'
import Chat from './pages/Chat'
import Memory from './pages/Memory'
import Insights from './pages/Insights'
import Settings from './pages/Settings'
import Auth from './pages/Auth'
import Onboarding from './pages/Onboarding'
import Features from './pages/Features'
import KnowledgeGraph from './pages/KnowledgeGraph'
import './App.css'

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(!!localStorage.getItem('ct_token'))
  const ctUser = JSON.parse(localStorage.getItem('ct_user') || '{}');
  const [isOnboarded, setIsOnboarded] = useState(ctUser.onboardingCompleted === true)

  // Listen for storage changes (helpful for multi-tab logout)
  useEffect(() => {
    const handleStorage = () => {
      setIsAuthenticated(!!localStorage.getItem('ct_token'))
      const u = JSON.parse(localStorage.getItem('ct_user') || '{}');
      setIsOnboarded(u.onboardingCompleted === true)
    };
    window.addEventListener('storage', handleStorage);
    return () => window.removeEventListener('storage', handleStorage);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('ct_token');
    localStorage.removeItem('ct_user');
    setIsAuthenticated(false);
  };

  const handleLoginSuccess = () => {
    setIsAuthenticated(true);
    const u = JSON.parse(localStorage.getItem('ct_user') || '{}');
    setIsOnboarded(u.onboardingCompleted === true);
  };

  if (!isAuthenticated) {
    return <Auth onLogin={handleLoginSuccess} />
  }

  if (!isOnboarded) {
    return <Onboarding onComplete={() => setIsOnboarded(true)} />
  }

  return (
    <Router>
      <div className="app-layout">
        <Sidebar onLogout={handleLogout} />
        <main className="main-content">
          <Routes>
            <Route path="/"              element={<Dashboard />} />
            <Route path="/chat"          element={<Chat />} />
            <Route path="/memory"        element={<Memory />} />
            <Route path="/knowledge"     element={<KnowledgeGraph />} />
            <Route path="/insights"      element={<Insights />} />
            <Route path="/features"      element={<Features />} />
            <Route path="/settings"      element={<Settings />} />
            <Route path="*"              element={<Navigate to="/" />} />
          </Routes>
        </main>
        <RightSidebar />
      </div>
    </Router>
  )
}

export default App
