import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import {
  RadarChart, Radar, PolarGrid, PolarAngleAxis, ResponsiveContainer,
  AreaChart, Area, XAxis, YAxis, Tooltip, BarChart, Bar, Cell
} from 'recharts'
import { TrendingUp, Brain, Zap, Target, Calendar, ChevronDown, History, AlertTriangle, ArrowRight } from 'lucide-react'
import Header from '../components/Header'
import './Insights.css'

const radarData = [
  { subject: 'Analytical', A: 92 },
  { subject: 'Creative',   A: 78 },
  { subject: 'Memory',     A: 85 },
  { subject: 'Focus',      A: 71 },
  { subject: 'Speed',      A: 88 },
  { subject: 'Verbal',     A: 82 },
]

const weeklyData = {
  'This Week': [
    { day: 'Mon', interactions: 24, insights: 8 },
    { day: 'Tue', interactions: 38, insights: 14 },
    { day: 'Wed', interactions: 31, insights: 11 },
    { day: 'Thu', interactions: 52, insights: 20 },
    { day: 'Fri', interactions: 47, insights: 18 },
    { day: 'Sat', interactions: 19, insights: 7 },
    { day: 'Sun', interactions: 28, insights: 10 },
  ],
  'Last Week': [
    { day: 'Mon', interactions: 18, insights: 6 },
    { day: 'Tue', interactions: 29, insights: 10 },
    { day: 'Wed', interactions: 44, insights: 16 },
    { day: 'Thu', interactions: 35, insights: 13 },
    { day: 'Fri', interactions: 51, insights: 19 },
    { day: 'Sat', interactions: 22, insights: 8 },
    { day: 'Sun', interactions: 15, insights: 5 },
  ],
}

const beliefTimeline = [
  { date: 'Oct 12', label: 'Baseline', value: 'High focus on security & growth' },
  { date: 'Oct 26', label: 'Drift Det.', value: 'Pivoted towards risk-taking logic', drift: true },
  { date: 'Nov 09', label: 'Merged', value: 'Balanced analytical empathy' },
]

const PERIODS = ['This Week', 'Last Week']

const topicData = [
  { topic: 'Tech',    value: 42 },
  { topic: 'Design',  value: 28 },
  { topic: 'Science', value: 19 },
  { topic: 'Art',     value: 14 },
]

const COLORS = ['#2563eb', '#7c3aed', '#0891b2', '#d97706', '#dc2626', '#16a34a']

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload?.length) {
    return (
      <div className="chart-tooltip">
        <p className="tooltip-label">{label}</p>
        {payload.map(p => (
          <p key={p.name} style={{ color: p.color, fontWeight: 600 }}>
            {p.name}: {p.value}
          </p>
        ))}
      </div>
    )
  }
  return null
}

export default function Insights() {
  const [period, setPeriod] = useState('This Week')
  const [needsUpdate, setNeedsUpdate] = useState(false)
  const ctUser = JSON.parse(localStorage.getItem('ct_user') || '{}')
  const isLovedOne = ctUser?.onboardingData?.cloningMode === 'loved_one'

  useEffect(() => {
    // Check for 14-day reassessment need
    const last = ctUser?.onboardingData?.completedAt || new Date().toISOString()
    const diff = (new Date() - new Date(last)) / (1000 * 60 * 60 * 24)
    if (diff > 14) setNeedsUpdate(true)
  }, [])

  const activityData = weeklyData[period]

  return (
    <div className="page">
      <Header title="Cognitive Insights" subtitle="Deep analytics of your thinking patterns" />

      <div className="insights-body">
        {/* KPI Row */}
        <div className="kpi-row">
          {[
            { label: 'Cognitive Score', value: '87.4', delta: '+3.2',  icon: Brain,      color: 'var(--primary)'  },
            { label: 'Total Interactions', value: '239', delta: '+18%', icon: Zap,        color: 'var(--accent)'   },
            { label: 'Health Score',  value: '92%',  delta: 'Optimal',   icon: Target,     color: 'var(--success)' },
            { label: 'Streak Days',     value: '14',   delta: 'Best: 21', icon: TrendingUp, color: 'var(--warning)'  },
          ].map(({ label, value, delta, icon: Icon, color }, i) => (
            <motion.div key={label} className="kpi-card" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.08 }}>
              <div className="kpi-icon" style={{ background: `${color}18`, color }}><Icon size={18} /></div>
              <div className="kpi-info">
                <span className="kpi-label">{label}</span>
                <span className="kpi-value">{value}</span>
                <span className="kpi-delta" style={{ color }}>{delta}</span>
              </div>
            </motion.div>
          ))}
        </div>

        {needsUpdate && !isLovedOne && (
          <motion.div className="update-callout" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}>
            <div className="callout-icon"><AlertTriangle size={24} /></div>
            <div className="callout-content">
              <h3>Belief Reassessment Due</h3>
              <p>It has been 14 days since your last cognitive sync. Your habits may have evolved. Let's update your twin's perspective.</p>
            </div>
            <button className="callout-btn">Reassess Now <ArrowRight size={16} /></button>
          </motion.div>
        )}

        <div className="charts-grid">
          {/* Belief Timeline */}
          <motion.div className="chart-card wide" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }}>
            <div className="chart-header">
              <h3>{isLovedOne ? 'Preserved Belief Timeline' : 'Belief Evolution Timeline'}</h3>
              <div className="history-badge"><History size={12} /> Version 1.2</div>
            </div>
            <div className="belief-timeline">
              {beliefTimeline.map((item, i) => (
                <div key={i} className={`timeline-item ${item.drift ? 'drift' : ''}`}>
                  <div className="timeline-marker"><div className="inner-dot" /></div>
                  <div className="timeline-content">
                    <span className="time-date">{item.date} • {item.label}</span>
                    <p className="time-desc">{item.value}</p>
                    {item.drift && <span className="drift-label">0.12 Magnitude Drift</span>}
                  </div>
                </div>
              ))}
            </div>
          </motion.div>

          {/* Radar */}
          <motion.div className="chart-card" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.25 }}>
            <div className="chart-header"><h3>Cognitive Map</h3></div>
            <ResponsiveContainer width="100%" height={240}>
              <RadarChart data={radarData}>
                <PolarGrid stroke="rgba(37,99,235,0.1)" />
                <PolarAngleAxis dataKey="subject" tick={{ fill: 'var(--text-muted)', fontSize: 11 }} />
                <Radar name="Score" dataKey="A" stroke="var(--primary)" fill="var(--primary)" fillOpacity={0.12} strokeWidth={2} />
              </RadarChart>
            </ResponsiveContainer>
          </motion.div>

          {/* Activity */}
          <motion.div className="chart-card wide" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }}>
            <div className="chart-header">
              <h3>Active Resonance — {period}</h3>
              <select className="period-select" value={period} onChange={e => setPeriod(e.target.value)}>
                {PERIODS.map(p => <option key={p} value={p}>{p}</option>)}
              </select>
            </div>
            <ResponsiveContainer width="100%" height={240}>
              <AreaChart data={activityData}>
                <XAxis dataKey="day" hide />
                <Tooltip content={<CustomTooltip />} />
                <Area type="monotone" dataKey="interactions" stroke="var(--primary)" fill="var(--primary)" fillOpacity={0.1} strokeWidth={2} />
                <Area type="monotone" dataKey="insights"     stroke="var(--accent)"  fill="var(--accent)"  fillOpacity={0.1} strokeWidth={2} />
              </AreaChart>
            </ResponsiveContainer>
          </motion.div>
        </div>
      </div>
    </div>
  )
}

