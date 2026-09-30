const mongoose = require('mongoose');

const doctorSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
  specialization: { type: String, required: [true, 'Specialization is required'], trim: true },
  qualification: { type: String, required: [true, 'Qualification is required'], trim: true },
  experience: { type: Number, required: true, min: 0 },
  consultationFee: { type: Number, required: true, min: 0 },
  bio: { type: String, default: '' },
  availableDays: {
    type: [String],
    default: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
  },
  availableTime: {
    start: { type: String, default: '09:00' }, // 24-hour format HH:MM
    end: { type: String, default: '17:00' },
  },
  profileImage: { type: String, default: '' },
  isActive: { type: Boolean, default: true },
});

module.exports = mongoose.model('Doctor', doctorSchema);