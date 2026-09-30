const User = require('../models/User');
const Doctor = require('../models/Doctor');
const Appointment = require('../models/Appointment');

const escapeRegex = (text) => text.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

// GET /api/admin/dashboard
const getDashboard = async (req, res, next) => {
  try {
    const [totalPatients, totalDoctors, totalAppointments, pendingAppointments, completedAppointments] =
      await Promise.all([
        User.countDocuments({ role: 'patient' }),
        Doctor.countDocuments(),
        Appointment.countDocuments(),
        Appointment.countDocuments({ status: 'pending' }),
        Appointment.countDocuments({ status: 'completed' }),
      ]);

    res.json({
      totalPatients, totalDoctors, totalAppointments, pendingAppointments, completedAppointments,
    });
  } catch (error) {
    next(error);
  }
};

// GET /api/admin/users?role=patient&search=
const getUsers = async (req, res, next) => {
  try {
    const { role, search } = req.query;
    const filter = {};
    if (role) filter.role = role;
    if (search) {
      const regex = new RegExp(escapeRegex(search), 'i');
      filter.$or = [{ name: regex }, { email: regex }];
    }
    const users = await User.find(filter).sort({ createdAt: -1 });
    res.json(users);
  } catch (error) {
    next(error);
  }
};

// DELETE /api/admin/users/:id   (patients only)
const deleteUser = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    if (user.role !== 'patient') {
      return res.status(400).json({ message: 'Only patient accounts can be deleted here' });
    }
    await Appointment.deleteMany({ patientId: user._id });
    await user.deleteOne();
    res.json({ message: 'Patient deleted successfully' });
  } catch (error) {
    next(error);
  }
};

// GET /api/admin/doctors?search=   (includes inactive doctors)
const getAllDoctors = async (req, res, next) => {
  try {
    const { search } = req.query;
    const filter = {};
    if (search) {
      const regex = new RegExp(escapeRegex(search), 'i');
      const matchedUsers = await User.find({ role: 'doctor', name: regex }).select('_id');
      filter.$or = [
        { userId: { $in: matchedUsers.map((u) => u._id) } },
        { specialization: regex },
      ];
    }
    const doctors = await Doctor.find(filter).populate('userId', 'name email phone gender');
    res.json(doctors);
  } catch (error) {
    next(error);
  }
};

// GET /api/admin/appointments?status=&date=
const getAllAppointments = async (req, res, next) => {
  try {
    const { status, date } = req.query;
    const filter = {};
    if (status) filter.status = status;
    if (date) filter.appointmentDate = date;

    const appointments = await Appointment.find(filter)
      .populate('patientId', 'name email phone')
      .populate({
        path: 'doctorId',
        select: 'specialization userId',
        populate: { path: 'userId', select: 'name' },
      })
      .sort({ appointmentDate: -1 });

    res.json(appointments);
  } catch (error) {
    next(error);
  }
};

module.exports = { getDashboard, getUsers, deleteUser, getAllDoctors, getAllAppointments };