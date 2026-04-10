require('dotenv').config()
const express  = require('express')
const mongoose = require('mongoose')
const cors     = require('cors')
const path     = require('path')

const app = express()

// ── Middleware ───────────────────────────────────────────────────────────────
app.use(cors())
app.use(express.json())
app.use(express.static(path.join(__dirname, '../frontend')))

// ── API Routes ───────────────────────────────────────────────────────────────
app.use('/api/auth',        require('./routes/auth.routes'))
app.use('/api/user',        require('./routes/user.routes'))
app.use('/api/onboarding',  require('./routes/onboarding.routes'))
app.use('/api/features',    require('./routes/features.routes'))

// ── Serve Frontend Pages ─────────────────────────────────────────────────────
const front = (file) => (_, res) =>
  res.sendFile(path.join(__dirname, `../frontend/${file}`))

app.get('/',            front('index.html'))
app.get('/signup',      front('signup.html'))
app.get('/dashboard',   front('dashboard.html'))
app.get('/onboarding',  front('onboarding.html'))
app.get('/features',    front('features.html'))

// ── 404 ──────────────────────────────────────────────────────────────────────
app.use((req, res) => {
  if (req.path.startsWith('/api'))
    return res.status(404).json({ success: false, message: 'API endpoint not found' })
  res.sendFile(path.join(__dirname, '../frontend/index.html'))
})

// ── Start ─────────────────────────────────────────────────────────────────────
const MONGO_URI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/cognitiveTwin'
const PORT      = process.env.PORT      || 5000

mongoose
  .connect(MONGO_URI)
  .then(() => {
    console.log('✅  MongoDB connected →', MONGO_URI)
    app.listen(PORT, () => {
      console.log(`🚀  Server running  → http://localhost:${PORT}`)
      console.log(`💻  Open browser   → http://localhost:${PORT}`)
    })
  })
  .catch((err) => {
    console.error('❌  MongoDB error:', err.message)
    console.error('    Make sure MongoDB is running: mongod')
    process.exit(1)
  })
