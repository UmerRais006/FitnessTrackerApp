const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const UserSchema = new mongoose.Schema({
  fullName: {
    type: String,
    required: [true, 'Please provide your full name'],
    trim: true,
    minlength: [3, 'Name must be at least 3 characters long'],
    maxlength: [50, 'Name cannot exceed 50 characters']
  },
  email: {
    type: String,
    required: [true, 'Please provide an email'],
    unique: true,
    lowercase: true,
    trim: true,
    match: [
      /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
      'Please provide a valid email address'
    ]
  },
  password: {
    type: String,
    required: [true, 'Please provide a password'],
    minlength: [8, 'Password must be at least 8 characters'],
    select: false // Don't return password in queries by default
  },
  isVerified: {
    type: Boolean,
    default: false
  },
  verificationToken: String,
  resetPasswordToken: String,
  resetPasswordExpire: Date,
  createdAt: {
    type: Date,
    default: Date.now
  },
  lastLogin: {
    type: Date
  },
  // Fitness-specific fields
  profile: {
    age: Number,
    gender: {
      type: String,
      enum: ['male', 'female', 'other']
    },
    height: Number, // in cm
    weight: Number, // in kg
    fitnessGoal: {
      type: String,
      enum: ['lose_weight', 'gain_muscle', 'maintain', 'improve_fitness']
    },
    activityLevel: {
      type: String,
      enum: ['sedentary', 'light', 'moderate', 'active', 'very_active']
    }
  }
}, {
  timestamps: true
});

// Encrypt password before saving
UserSchema.pre('save', async function(next) {
  // Only hash the password if it has been modified (or is new)
  if (!this.isModified('password')) {
    return next();
  }

  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

// Method to compare password for login
UserSchema.methods.comparePassword = async function(candidatePassword) {
  try {
    return await bcrypt.compare(candidatePassword, this.password);
  } catch (error) {
    throw new Error('Password comparison failed');
  }
};

UserSchema.methods.generateAuthToken = function() {
  return jwt.sign(
    { id: this._id, email: this.email },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRE }
  );
};


UserSchema.methods.generateVerificationToken = function() {
  const token = Math.random().toString(36).substring(2, 15) + 
                Math.random().toString(36).substring(2, 15);
  this.verificationToken = token;
  return token;
};

UserSchema.statics.findByCredentials = async function(email, password) {
  try {
    
    const emailLower = email.toLowerCase();
    console.log('Finding user with email:', emailLower);
    
    const user = await this.findOne({ email: emailLower }).select('+password');
    
    if (!user) {
      console.log('User not found with email:', emailLower);
      throw new Error('Invalid email or password');
    }
    
    console.log('User found, comparing password...');
    const isPasswordMatch = await user.comparePassword(password);
    console.log('Password match result:', isPasswordMatch);
    
    if (!isPasswordMatch) {
      console.log('Password does not match for user:', emailLower);
      throw new Error('Invalid email or password');
    }
    
    console.log('Login successful for user:', emailLower);
    return user;
  } catch (error) {
    console.error('Error in findByCredentials:', error.message);
    throw error;
  }
};

module.exports = mongoose.model('User', UserSchema);
