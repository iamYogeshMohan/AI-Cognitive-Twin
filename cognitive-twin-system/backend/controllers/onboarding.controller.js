const Onboarding = require('../models/Onboarding.model')
const User       = require('../models/User.model')

// ── GET /api/onboarding ──────────────────────────────────────────────────────
exports.getOnboarding = async (req, res) => {
  try {
    const data = await Onboarding.findOne({ userId: req.user._id })
    res.json({ success: true, data })
  } catch (err) {
    res.status(500).json({ success: false, message: err.message })
  }
}

// ── POST /api/onboarding ─────────────────────────────────────────────────────
exports.saveOnboarding = async (req, res) => {
  const { step, data } = req.body
  try {
    let ob = await Onboarding.findOne({ userId: req.user._id })
    if (!ob) ob = new Onboarding({ userId: req.user._id })

    if (step && data) ob[step] = { ...ob[step]?.toObject?.() ?? ob[step], ...data }

    if (step === 'step5') {
      ob.step5.completed = true
      ob.completedAt = new Date()
      await User.findByIdAndUpdate(req.user._id, { onboardingCompleted: true })
    }

    await ob.save()
    res.json({ success: true, message: 'Saved', data: ob })
  } catch (err) {
    res.status(500).json({ success: false, message: err.message })
  }
}
