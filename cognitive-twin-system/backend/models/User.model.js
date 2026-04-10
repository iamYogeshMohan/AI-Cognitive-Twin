const mongoose = require('mongoose')
const bcrypt = require('bcryptjs')

const userSchema = new mongoose.Schema({
  name:                { type: String, required: true, trim: true },
  email:               { type: String, required: true, unique: true, lowercase: true, trim: true },
  password:            { type: String, required: true, minlength: 6 },
  onboardingCompleted: { type: Boolean, default: false },
  createdAt:           { type: Date, default: Date.now },
})

// Hash password before saving
userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next()
  const salt = await bcrypt.genSalt(12)
  this.password = await bcrypt.hash(this.password, salt)
  next()
})

// Compare entered password with hashed
userSchema.methods.matchPassword = async function (entered) {
  return await bcrypt.compare(entered, this.password)
}

module.exports = mongoose.model('User', userSchema)
