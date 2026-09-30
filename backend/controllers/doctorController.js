const User = require('../models/User');
const Doctor = require('../models/Doctor');
const { isValidDateString, getTodayString, getSlotsForDate } = require('../utils/slotHelper');

const escapeRegex = (text) => text.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
const isValidPhone = (phone) => /^\d{10}$/.test(phone);
const isValidEmail = (email) => /^\S+@\S+\.\S+$/.test(email);
const timeRegex = /^([01]\d|2[0-3]):[0-5]\d$/;

const populateUser = { path: 'userId', select: 'name email phone gender' };

// GET /api/doctors?search=&specialization=   (public, active doctors only)
const getDoctors = async (req, res, next) => {
  try {
    const { search, specialization } = req.query;
    const filter = { isActive: true };

    if (specialization && specialization !== 'All') {
      filter.specialization = specialization;
    }

    if (search) {
      const regex = new RegExp(escapeRegex(search), 'i');
      const matchedUsers = await User.find({ role: 'doctor', name: regex }).select('_id');
      filter.$or = [
        { userId: { $in: matchedUsers.map((u) => u._id) } },
        { specialization: regex },
      ];
    }

    const doctors = await Doctor.find(filter).populate(populateUser);
    res.json(doctors);
  } catch (error) {
    next(error);
  }
};

// GET /api/doctors/:id
const getDoctorById = async (req, res, next) => {
  try {
    const doctor = await Doctor.findById(req.params.id).populate(populateUser);
    if (!doctor) {
      return res.status(404).json({ message: 'Doctor not found' });
    }
    res.json(doctor);
  } catch (error) {
    next(error);
  }
};

// GET /api/doctors/:id/slots?date=YYYY-MM-DD
const getDoctorSlots = async (req, res, next) => {
  try {
    const { date } = req.query;
    if (!isValidDateString(date)) {
      return res.status(400).json({ message: 'Please provide a valid date (YYYY-MM-DD)' });
    }
    if (date < getTodayString()) {
      return res.status(400).json({ message: 'Appointment date cannot be in the past' });
    }

    const doctor = await Doctor.findById(req.params.id);
    if (!doctor || !doctor.isActive) {
      return res.status(404).json({ message: 'Doctor not found' });
    }

    const slots = await getSlotsForDate(doctor, date);
    res.json({ date, slots });
  } catch (error) {
    next(error);
  }
};

// POST /api/doctors   (admin) - creates the user account + doctor profile
const createDoctor = async (req, res, next) => {
  let createdUser = null;
  try {
    const {
      name, email, password, phone, gender, specialization, qualification,
      experience, consultationFee, bio, availableDays, availableTime, profileImage,
    } = req.body;

    if (!name || !email || !password || !phone || !specialization || !qualification ||
        experience === undefined || consultationFee === undefined) {
      return res.status(400).json({ message: 'Please fill in all required fields' });
    }
    if (!isValidEmail(email)) {
      return res.status(400).json({ message: 'Please enter a valid email address' });
    }
    if (password.length < 6) {
      return res.status(400).json({ message: 'Password must be at least 6 characters' });
    }
    if (!isValidPhone(phone)) {
      return res.status(400).json({ message: 'Phone number must be 10 digits' });
    }
    if (availableTime && (!timeRegex.test(availableTime.start) || !timeRegex.test(availableTime.end) ||
        availableTime.start >= availableTime.end)) {
      return res.status(400).json({ message: 'Invalid available time range' });
    }

    const exists = await User.findOne({ email: email.toLowerCase() });
    if (exists) {
      return res.status(400).json({ message: 'Email already exists' });
    }

    createdUser = await User.create({ name, email, password, phone, gender, role: 'doctor' });

    const doctor = await Doctor.create({
      userId: createdUser._id,
      specialization, qualification, experience, consultationFee,
      bio, availableDays, availableTime, profileImage,
    });

    const populated = await doctor.populate(populateUser);
    res.status(201).json(populated);
  } catch (error) {
    // Roll back the user if doctor profile creation failed
    if (createdUser) await User.findByIdAndDelete(createdUser._id);
    next(error);
  }
};

// PUT /api/doctors/:id   (admin or the doctor themselves)
const updateDoctor = async (req, res, next) => {
  try {
    const doctor = await Doctor.findById(req.params.id);
    if (!doctor) {
      return res.status(404).json({ message: 'Doctor not found' });
    }

    const isAdmin = req.user.role === 'admin';
    const isOwner = req.user.role === 'doctor' && doctor.userId.toString() === req.user._id.toString();
    if (!isAdmin && !isOwner) {
      return res.status(403).json({ message: 'Unauthorized access' });
    }

    const {
      name, phone, qualification, experience, consultationFee, bio,
      availableDays, availableTime, profileImage, specialization, isActive,
    } = req.body;

    if (phone && !isValidPhone(phone)) {
      return res.status(400).json({ message: 'Phone number must be 10 digits' });
    }
    if (availableTime && (!timeRegex.test(availableTime.start) || !timeRegex.test(availableTime.end) ||
        availableTime.start >= availableTime.end)) {
      return res.status(400).json({ message: 'Invalid available time range' });
    }

    if (qualification !== undefined) doctor.qualification = qualification;
    if (experience !== undefined) doctor.experience = experience;
    if (consultationFee !== undefined) doctor.consultationFee = consultationFee;
    if (bio !== undefined) doctor.bio = bio;
    if (availableDays !== undefined) doctor.availableDays = availableDays;
    if (availableTime !== undefined) doctor.availableTime = availableTime;
    if (profileImage !== undefined) doctor.profileImage = profileImage;

    // Only admin can change these
    if (isAdmin) {
      if (specialization !== undefined) doctor.specialization = specialization;
      if (isActive !== undefined) doctor.isActive = isActive;
    }

    await doctor.save();

    if (name || phone) {
      const user = await User.findById(doctor.userId);
      if (name) user.name = name;
      if (phone) user.phone = phone;
      await user.save();
    }

    const populated = await Doctor.findById(doctor._id).populate(populateUser);
    res.json(populated);
  } catch (error) {
    next(error);
  }
};

// DELETE /api/doctors/:id   (admin) - deactivates the doctor (soft delete)
const deleteDoctor = async (req, res, next) => {
  try {
    const doctor = await Doctor.findById(req.params.id);
    if (!doctor) {
      return res.status(404).json({ message: 'Doctor not found' });
    }
    doctor.isActive = false;
    await doctor.save();
    res.json({ message: 'Doctor deactivated successfully' });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getDoctors, getDoctorById, getDoctorSlots, createDoctor, updateDoctor, deleteDoctor,
};