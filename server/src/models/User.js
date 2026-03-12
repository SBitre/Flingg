const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true,
  },
  password: {
    type: String,
    required: true,
    minlength: 6,
  },
  name: {
    type: String,
    required: true,
    trim: true,
  },
  age: {
    type: Number,
    min: 18,
    max: 80,
  },
  gender: {
    type: String,
    enum: ['male', 'female', 'non-binary', 'other'],
  },
  interestedIn: {
    type: [String],
    default: ['everyone'],
  },
  bio: {
    type: String,
    maxlength: 300,
    default: '',
  },
  photos: {
    type: [String],
    default: [],
  },
  location: {
    type: String,
    enum: ['Calangute', 'Baga', 'Anjuna', 'Panjim', 'Vagator', 'Morjim', 'Other'],
    default: 'Other',
  },
  likes: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  }],
  passes: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  }],
  matches: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  }],
  profileComplete: {
    type: Boolean,
    default: false,
  },
  lastActive: {
    type: Date,
    default: Date.now,
  },
}, { timestamps: true });

// Hash password before saving
userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 12);
  next();
});

// Compare password
userSchema.methods.comparePassword = async function (candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

// Remove sensitive fields from JSON output
userSchema.methods.toJSON = function () {
  const obj = this.toObject();
  delete obj.password;
  delete obj.likes;
  delete obj.passes;
  return obj;
};

module.exports = mongoose.model('User', userSchema);
