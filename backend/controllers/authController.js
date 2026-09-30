const jwt = require('jsonwebtoken');
const User = require('../models/User');
const Doctor = require('../models/Doctor');

const generateToken = (id) =>
  jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: '7d' });

const isValidEmail = (email) => /^\S+@\S+\.\S+$/.test(email);
const isValidPhone = (phone) => /^\d{10}$/.test(phone);

const formatUser = (user) => ({
  _id: user._id,
  name: user.name,
  email: user.email,
  phone: user.phone,
  role: user.role,
  gender: user.gender,
  dateOfBirth: user.dateOfBirth,
  address: user.address,
});

// POST /api/auth/register  (patients only)
const register = async (req, res, next) => {
  try {
    const { name, email, password, confirmPassword, phone, gender, dateOfBirth, address } = req.body;

    if (!name || !email || !password || !confirmPassword || !phone || !gender || !dateOfBirth || !address) {
      return res.status(400).json({ message: 'Please fill in all required fields' });
    }
    if (!isValidEmail(email)) {
      return res.status(400).json({ message: 'Please enter a valid email address' });
    }
    if (password.length < 6) {
      return res.status(400).json({ message: 'Password must be at least 6 characters' });
    }
    if (password !== confirmPassword) {
      return res.status(400).json({ message: 'Passwords do not match' });
    }
    if (!isValidPhone(phone)) {
      return res.status(400).json({ message: 'Phone number must be 10 digits' });
    }
    if (new Date(dateOfBirth) > new Date()) {
      return res.status(400).json({ message: 'Date of birth cannot be in the future' });
    }

    const exists = await User.findOne({ email: email.toLowerCase() });
    if (exists) {
      return res.status(400).json({ message: 'Email already exists' });
    }

    const user = await User.create({
      name, email, password, phone, gender, dateOfBirth, address, role: 'patient',
    });

    res.status(201).json({ token: generateToken(user._id), user: formatUser(user) });
  } catch (error) {
    next(error);
  }
};

// POST /api/auth/login
const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required' });
    }

    const user = await User.findOne({ email: email.toLowerCase() }).select('+password');
    if (!user || !(await user.matchPassword(password))) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    if (user.role === 'doctor') {
      const doctor = await Doctor.findOne({ userId: user._id });
      if (!doctor || !doctor.isActive) {
        return res.status(403).json({ message: 'Your account has been deactivated. Contact admin.' });
      }
    }

    res.json({ token: generateToken(user._id), user: formatUser(user) });
  } catch (error) {
    next(error);
  }
};

// GET /api/auth/profile
const getProfile = async (req, res, next) => {
  try {
    let doctor = null;
    if (req.user.role === 'doctor') {
      doctor = await Doctor.findOne({ userId: req.user._id });
    }
    res.json({ user: formatUser(req.user), doctor });
  } catch (error) {
    next(error);
  }
};

// PUT /api/auth/profile
const updateProfile = async (req, res, next) => {
  try {
    const { name, phone, gender, dateOfBirth, address } = req.body;

    if (phone && !isValidPhone(phone)) {
      return res.status(400).json({ message: 'Phone number must be 10 digits' });
    }

    const user = await User.findById(req.user._id);
    if (name) user.name = name;
    if (phone) user.phone = phone;
    if (gender) user.gender = gender;
    if (dateOfBirth) user.dateOfBirth = dateOfBirth;
    if (address) user.address = address;
    await user.save();

    res.json({ message: 'Profile updated successfully', user: formatUser(user) });
  } catch (error) {
    next(error);
  }
};

module.exports = { register, login, getProfile, updateProfile };