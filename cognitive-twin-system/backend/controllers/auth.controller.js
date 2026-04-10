const User = require('../models/User.model')
const jwt  = require('jsonwebtoken')

const signToken = (id) =>
  jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRE || '7d' })

// ── POST /api/auth/signup ────────────────────────────────────────────────────
exports.signup = async (req, res) => {
  const { name, email, password } = req.body
  if (!name || !email || !password)
    return res.status(400).json({ success: false, message: 'Please fill in all fields' })
  if (password.length < 6)
    return res.status(400).json({ success: false, message: 'Password must be at least 6 characters' })

  try {
    if (await User.findOne({ email }))
      return res.status(409).json({ success: false, message: 'Email already registered' })

    const user  = await User.create({ name, email, password })
    const token = signToken(user._id)

    res.status(201).json({
      success: true,
      message: 'Account created!',
      token,
      user: { id: user._id, name: user.name, email: user.email, onboardingCompleted: user.onboardingCompleted },
    })
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error', error: err.message })
  }
}

// ── POST /api/auth/login ─────────────────────────────────────────────────────
exports.login = async (req, res) => {
  const { email, password } = req.body
  if (!email || !password)
    return res.status(400).json({ success: false, message: 'Please provide email and password' })

  try {
    const user = await User.findOne({ email })
    if (!user || !(await user.matchPassword(password)))
      return res.status(401).json({ success: false, message: 'Invalid email or password' })

    const token = signToken(user._id)
    res.json({
      success: true,
      message: 'Login successful',
      token,
      user: { id: user._id, name: user.name, email: user.email, onboardingCompleted: user.onboardingCompleted },
    })
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error', error: err.message })
  }
}
