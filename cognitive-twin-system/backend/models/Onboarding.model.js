const mongoose = require('mongoose')

const onboardingSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, unique: true },

  step1: {
    welcomed: { type: Boolean, default: true },
  },
  step2: {
    problemSolving:  { type: String, default: '' },
    learningStyle:   { type: String, default: '' },
    decisionMaking:  { type: String, default: '' },
    creativityLevel: { type: String, default: '' },
    workStyle:       { type: String, default: '' },
  },
  step3: {
    aboutMe: { type: String, default: '' },
  },
  step4: {
    messageSamples: { type: [String], default: [] },
  },
  step5: {
    completed: { type: Boolean, default: false },
  },

  completedAt: { type: Date },
  createdAt:   { type: Date, default: Date.now },
})

module.exports = mongoose.model('Onboarding', onboardingSchema)
