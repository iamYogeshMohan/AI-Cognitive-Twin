import { useEffect, useRef, useState, useCallback } from 'react'
import { motion } from 'framer-motion'
import { GitBranch, ZoomIn, ZoomOut, RotateCcw, Info } from 'lucide-react'
import Header from '../components/Header'
import { getAllMemories } from '../services/memory'
import './KnowledgeGraph.css'

const CAT_COLORS = {
  Technical: '#6c63ff',
  Creative:  '#f59e0b',
  Personal:  '#10b981',
  Cognitive: '#ec4899',
}

function buildGraph(memories) {
  const nodes = []
  const links = []

  // Central hub node
  nodes.push({ id: 'hub', label: 'My Mind', type: 'hub', x: 0, y: 0, vx: 0, vy: 0 })

  // Category nodes
  const cats = [...new Set(memories.map(m => m.category))]
  cats.forEach((cat, i) => {
    const angle = (2 * Math.PI * i) / cats.length
    nodes.push({
      id: `cat-${cat}`,
      label: cat,
      type: 'category',
      cat,
      x: Math.cos(angle) * 160,
      y: Math.sin(angle) * 160,
      vx: 0, vy: 0,
    })
    links.push({ source: 'hub', target: `cat-${cat}` })
  })

  // Memory nodes
  memories.slice(0, 20).forEach((m, i) => {
    const catAngle = cats.indexOf(m.category) / cats.length * 2 * Math.PI
    const spread = (i % 5) / 5 * 0.8 - 0.4
    const angle = catAngle + spread
    nodes.push({
      id: `mem-${m.id}`,
      label: m.title.length > 18 ? m.title.slice(0, 18) + '…' : m.title,
      fullTitle: m.title,
      fullContent: m.content,
      type: 'memory',
      cat: m.category,
      starred: m.starred,
      tags: m.tags,
      x: Math.cos(angle) * (260 + (i % 3) * 50),
      y: Math.sin(angle) * (260 + (i % 3) * 50),
      vx: 0, vy: 0,
    })
    links.push({ source: `cat-${m.category}`, target: `mem-${m.id}` })
  })

  // Tag cross-links
  const tagMap = {}
  memories.slice(0, 20).forEach(m => {
    m.tags.forEach(tag => {
      if (!tagMap[tag]) tagMap[tag] = []
      tagMap[tag].push(`mem-${m.id}`)
    })
  })
  Object.values(tagMap).forEach(group => {
    if (group.length > 1) {
      for (let i = 0; i < group.length - 1; i++) {
        links.push({ source: group[i], target: group[i + 1], dashed: true })
      }
    }
  })

  return { nodes, links }
}

function runForce(nodes, links, iterations = 60) {
  const nodeMap = Object.fromEntries(nodes.map(n => [n.id, n]))
  for (let iter = 0; iter < iterations; iter++) {
    const alpha = 1 - iter / iterations
    // Repulsion
    for (let i = 0; i < nodes.length; i++) {
      for (let j = i + 1; j < nodes.length; j++) {
        const a = nodes[i], b = nodes[j]
        const dx = b.x - a.x || 0.01
        const dy = b.y - a.y || 0.01
        const d = Math.sqrt(dx * dx + dy * dy) || 1
        const force = (80 * 80) / d * alpha * 0.2
        a.vx -= dx / d * force
        a.vy -= dy / d * force
        b.vx += dx / d * force
        b.vy += dy / d * force
      }
    }
    // Attraction along links
    links.forEach(l => {
      const src = nodeMap[l.source], tgt = nodeMap[l.target]
      if (!src || !tgt) return
      const dx = tgt.x - src.x
      const dy = tgt.y - src.y
      const d = Math.sqrt(dx * dx + dy * dy) || 1
      const ideal = l.dashed ? 100 : 120
      const force = (d - ideal) * 0.05 * alpha
      const fx = dx / d * force, fy = dy / d * force
      src.vx += fx; src.vy += fy
      tgt.vx -= fx; tgt.vy -= fy
    })
    // Apply velocity + damping (skip hub)
    nodes.forEach(n => {
      if (n.id === 'hub') return
      n.x += n.vx * 0.6
      n.y += n.vy * 0.6
      n.vx *= 0.5
      n.vy *= 0.5
    })
  }
}

export default function KnowledgeGraph() {
  const canvasRef = useRef(null)
  const stateRef = useRef({ nodes: [], links: [], scale: 1, offsetX: 0, offsetY: 0, selected: null, dragging: null, dragStart: null, panStart: null })
  const [selected, setSelected] = useState(null)
  const [scale, setScale] = useState(1)
  const animRef = useRef(null)
  const [stats, setStats] = useState({ nodes: 0, links: 0 })

  const draw = useCallback(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    const { nodes, links, scale: s, offsetX, offsetY, selected: sel } = stateRef.current
    const W = canvas.width, H = canvas.height

    ctx.clearRect(0, 0, W, H)

    // Light background
    ctx.fillStyle = '#f8f9fc'
    ctx.fillRect(0, 0, W, H)

    // Grid dots
    ctx.fillStyle = 'rgba(30, 60, 180, 0.08)'
    const gridSize = 40 * s
    const gOffX = (offsetX % gridSize + gridSize) % gridSize
    const gOffY = (offsetY % gridSize + gridSize) % gridSize
    for (let x = gOffX; x < W; x += gridSize)
      for (let y = gOffY; y < H; y += gridSize)
        ctx.fillRect(x - 1, y - 1, 2, 2)

    ctx.save()
    ctx.translate(W / 2 + offsetX, H / 2 + offsetY)
    ctx.scale(s, s)

    const nodeMap = Object.fromEntries(nodes.map(n => [n.id, n]))

    // Links
    links.forEach(l => {
      const src = nodeMap[l.source], tgt = nodeMap[l.target]
      if (!src || !tgt) return
      const isHighlighted = sel && (sel.id === src.id || sel.id === tgt.id)
      ctx.beginPath()
      ctx.moveTo(src.x, src.y)
      ctx.lineTo(tgt.x, tgt.y)
      if (l.dashed) {
        ctx.setLineDash([4, 8])
        ctx.strokeStyle = isHighlighted ? 'rgba(79, 70, 229, 0.6)' : 'rgba(30, 60, 180, 0.1)'
        ctx.lineWidth = isHighlighted ? 1.5 : 0.8
      } else {
        ctx.setLineDash([])
        ctx.strokeStyle = isHighlighted ? 'rgba(79, 70, 229, 0.8)' : 'rgba(30, 60, 180, 0.2)'
        ctx.lineWidth = isHighlighted ? 2 : 1
      }
      ctx.stroke()
      ctx.setLineDash([])
    })

    // Nodes
    nodes.forEach(n => {
      const isSel = sel?.id === n.id
      let r = n.type === 'hub' ? 28 : n.type === 'category' ? 18 : 10
      if (isSel) r += 4
      const color = n.type === 'hub' ? '#4f46e5' : CAT_COLORS[n.cat] || '#4f46e5'

      // Glow
      if (isSel || n.type !== 'memory') {
        const grd = ctx.createRadialGradient(n.x, n.y, 0, n.x, n.y, r * 2.5)
        grd.addColorStop(0, color + '40')
        grd.addColorStop(1, 'transparent')
        ctx.beginPath()
        ctx.arc(n.x, n.y, r * 2.5, 0, Math.PI * 2)
        ctx.fillStyle = grd
        ctx.fill()
      }

      // Node circle
      ctx.beginPath()
      ctx.arc(n.x, n.y, r, 0, Math.PI * 2)
      const grad = ctx.createRadialGradient(n.x - r * 0.3, n.y - r * 0.3, 0, n.x, n.y, r)
      grad.addColorStop(0, color + 'ff')
      grad.addColorStop(1, color + '88')
      ctx.fillStyle = grad
      ctx.fill()
      ctx.strokeStyle = isSel ? '#fff' : color + 'bb'
      ctx.lineWidth = isSel ? 2 : 1
      ctx.stroke()

      // Star badge
      if (n.starred) {
        ctx.fillStyle = '#f59e0b'
        ctx.font = `${r * 0.9}px sans-serif`
        ctx.textAlign = 'center'
        ctx.textBaseline = 'middle'
        ctx.fillText('★', n.x + r * 0.6, n.y - r * 0.6)
      }

      // Label
      ctx.fillStyle = n.type === 'memory' ? '#475569' : '#1e293b'
      ctx.font = `${n.type === 'hub' ? '700 13px' : n.type === 'category' ? '700 12px' : '500 11px'} 'Outfit', sans-serif`
      ctx.textAlign = 'center'
      ctx.textBaseline = 'top'
      ctx.fillText(n.label, n.x, n.y + r + 6)
    })

    ctx.restore()
  }, [])

  useEffect(() => {
    const memories = getAllMemories()
    const { nodes, links } = buildGraph(memories)
    runForce(nodes, links, 80)
    stateRef.current.nodes = nodes
    stateRef.current.links = links
    setStats({ nodes: nodes.length, links: links.length })
    draw()
  }, [draw])

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const resize = () => {
      canvas.width = canvas.offsetWidth
      canvas.height = canvas.offsetHeight
      draw()
    }
    resize()
    window.addEventListener('resize', resize)
    return () => window.removeEventListener('resize', resize)
  }, [draw])

  const getNode = (mx, my) => {
    const canvas = canvasRef.current
    const { nodes, scale: s, offsetX, offsetY } = stateRef.current
    const cx = canvas.width / 2 + offsetX
    const cy = canvas.height / 2 + offsetY
    const wx = (mx - cx) / s
    const wy = (my - cy) / s
    return nodes.find(n => {
      const r = n.type === 'hub' ? 28 : n.type === 'category' ? 18 : 12
      return Math.hypot(n.x - wx, n.y - wy) <= r + 4
    }) || null
  }

  const onMouseMove = (e) => {
    const rect = canvasRef.current.getBoundingClientRect()
    const mx = e.clientX - rect.left, my = e.clientY - rect.top
    const st = stateRef.current

    if (st.dragging) {
      const node = st.nodes.find(n => n.id === st.dragging)
      if (node) {
        const cx = canvasRef.current.width / 2 + st.offsetX
        const cy = canvasRef.current.height / 2 + st.offsetY
        node.x = (mx - cx) / st.scale
        node.y = (my - cy) / st.scale
        draw()
      }
      return
    }
    if (st.panStart) {
      st.offsetX = st.panStart.ox + (mx - st.panStart.mx)
      st.offsetY = st.panStart.oy + (my - st.panStart.my)
      draw()
      return
    }
    canvasRef.current.style.cursor = getNode(mx, my) ? 'pointer' : 'grab'
  }

  const onMouseDown = (e) => {
    const rect = canvasRef.current.getBoundingClientRect()
    const mx = e.clientX - rect.left, my = e.clientY - rect.top
    const node = getNode(mx, my)
    if (node) {
      stateRef.current.dragging = node.id
    } else {
      const st = stateRef.current
      st.panStart = { mx, my, ox: st.offsetX, oy: st.offsetY }
    }
  }

  const onMouseUp = (e) => {
    const rect = canvasRef.current.getBoundingClientRect()
    const mx = e.clientX - rect.left, my = e.clientY - rect.top
    const st = stateRef.current

    if (!st.dragging && !st.panStart) return
    const wasDragging = !!st.dragging
    const node = wasDragging ? st.nodes.find(n => n.id === st.dragging) : getNode(mx, my)

    st.dragging = null
    st.panStart = null

    if (node && node.type === 'memory') {
      st.selected = node
      setSelected(node)
      draw()
    }
  }

  const onWheel = (e) => {
    e.preventDefault()
    const st = stateRef.current
    const delta = e.deltaY > 0 ? 0.9 : 1.1
    st.scale = Math.min(3, Math.max(0.3, st.scale * delta))
    setScale(st.scale)
    draw()
  }

  const zoom = (dir) => {
    const st = stateRef.current
    st.scale = Math.min(3, Math.max(0.3, st.scale * (dir > 0 ? 1.2 : 0.8)))
    setScale(st.scale)
    draw()
  }

  const reset = () => {
    const st = stateRef.current
    st.scale = 1; st.offsetX = 0; st.offsetY = 0; st.selected = null
    setScale(1); setSelected(null)
    draw()
  }

  return (
    <div className="page kg-page">
      <Header title="Knowledge Graph" subtitle="Visual map of your cognitive memory network" />

      <div className="kg-body">
        {/* Stats Bar */}
        <div className="kg-stats-bar">
          <div className="kg-stat"><span className="kg-stat-n">{stats.nodes}</span><span className="kg-stat-l">Nodes</span></div>
          <div className="kg-stat"><span className="kg-stat-n">{stats.links}</span><span className="kg-stat-l">Connections</span></div>
          <div className="kg-stat"><span className="kg-stat-n">{Math.round(scale * 100)}%</span><span className="kg-stat-l">Zoom</span></div>
          <div className="kg-legend">
            {Object.entries(CAT_COLORS).map(([cat, color]) => (
              <span key={cat} className="kg-legend-item" style={{ '--dot': color }}>
                <span className="kg-dot" /> {cat}
              </span>
            ))}
          </div>
        </div>

        <div className="kg-canvas-wrap">
          <canvas
            ref={canvasRef}
            className="kg-canvas"
            onMouseMove={onMouseMove}
            onMouseDown={onMouseDown}
            onMouseUp={onMouseUp}
            onMouseLeave={() => { stateRef.current.dragging = null; stateRef.current.panStart = null }}
            onWheel={onWheel}
          />

          {/* Controls */}
          <div className="kg-controls">
            <button className="kg-ctrl-btn" onClick={() => zoom(1)} title="Zoom In"><ZoomIn size={15} /></button>
            <button className="kg-ctrl-btn" onClick={() => zoom(-1)} title="Zoom Out"><ZoomOut size={15} /></button>
            <button className="kg-ctrl-btn" onClick={reset} title="Reset"><RotateCcw size={15} /></button>
          </div>

          <div className="kg-hint"><Info size={11} /> Drag nodes · Scroll to zoom · Pan to explore</div>
        </div>

        {/* Detail Panel */}
        {selected && (
          <motion.div
            className="kg-detail"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
          >
            <div className="kg-detail-header">
              <span className="kg-detail-cat" style={{ color: CAT_COLORS[selected.cat] }}>{selected.cat}</span>
              <button className="kg-detail-close" onClick={() => { stateRef.current.selected = null; setSelected(null); draw() }}>✕</button>
            </div>
            <h3 className="kg-detail-title">{selected.fullTitle}</h3>
            <p className="kg-detail-content">{selected.fullContent}</p>
            {selected.tags?.length > 0 && (
              <div className="kg-detail-tags">
                {selected.tags.map(t => (
                  <span key={t} className="kg-tag" style={{ borderColor: CAT_COLORS[selected.cat] + '60' }}>#{t}</span>
                ))}
              </div>
            )}
          </motion.div>
        )}
      </div>
    </div>
  )
}
