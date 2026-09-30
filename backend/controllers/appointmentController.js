const Appointment = require('../models/Appointment');
const Doctor = require('../models/Doctor');
const { isValidDateString, getTodayString, getSlotsForDate } = require('../utils/slotHelper');

const populateAll = [
  { path: 'patientId', select: 'name email phone gender dateOfBirth address' },
  {
    path: 'doctorId',
    select: 'specialization consultationFee userId',
    populate: { path: 'userId', select: 'name email phone' },
  },
];

// Checks whether the logged-in user is allowed to see/change this appointment
const canAccess = async (appointment, user) => {
  if (user.role === 'admin') return true;
  if (user.role === 'patient') {
    return appointment.patientId.toString() === user._id.toString();
  }
  if (user.role === 'doctor') {
    const doctor = await Doctor.findOne({ userId: user._id });
    return doctor && appointment.doctorId.toString() === doctor._id.toString();
  }
  return false;
};

// POST /api/appointments   (patient)
const createAppointment = async (req, res, next) => {
  try {
    const { doctorId, appointmentDate, appointmentTime, reason } = req.body;

    if (!doctorId || !appointmentDate || !appointmentTime || !reason || !reason.trim()) {
      return res.status(400).json({ message: 'Please fill in all required fields' });
    }
    if (!isValidDateString(appointmentDate)) {
      return res.status(400).json({ message: 'Invalid appointment date' });
    }
    if (appointmentDate < getTodayString()) {
      return res.status(400).json({ message: 'Appointment date cannot be in the past' });
    }

    const doctor = await Doctor.findById(doctorId);
    if (!doctor || !doctor.isActive) {
      return res.status(404).json({ message: 'Doctor not found' });
    }

    // Is this time a valid slot for that doctor on that date?
    const slots = await getSlotsForDate(doctor, appointmentDate);
    const slot = slots.find((s) => s.time === appointmentTime);
    if (!slot) {
      return res.status(400).json({ message: 'Doctor is not available at the selected date/time' });
    }

    // Double-booking check
    const alreadyBooked = await Appointment.findOne({
      doctorId,
      appointmentDate,
      appointmentTime,
      status: { $in: ['pending', 'confirmed'] },
    });
    if (alreadyBooked) {
      return res.status(409).json({ message: 'Appointment slot already booked. Please choose another time.' });
    }

    const appointment = await Appointment.create({
      patientId: req.user._id,
      doctorId,
      appointmentDate,
      appointmentTime,
      reason: reason.trim(),
    });

    const populated = await Appointment.findById(appointment._id).populate(populateAll);
    res.status(201).json(populated);
  } catch (error) {
    next(error);
  }
};

// GET /api/appointments?status=&date=   (own appointments; admin sees all)
const getAppointments = async (req, res, next) => {
  try {
    const { status, date } = req.query;
    const filter = {};

    if (req.user.role === 'patient') {
      filter.patientId = req.user._id;
    } else if (req.user.role === 'doctor') {
      const doctor = await Doctor.findOne({ userId: req.user._id });
      if (!doctor) {
        return res.status(404).json({ message: 'Doctor profile not found' });
      }
      filter.doctorId = doctor._id;
    }

    if (status) filter.status = status;
    if (date) filter.appointmentDate = date;

    const appointments = await Appointment.find(filter)
      .populate(populateAll)
      .sort({ appointmentDate: -1, appointmentTime: 1 });

    res.json(appointments);
  } catch (error) {
    next(error);
  }
};

// GET /api/appointments/:id
const getAppointmentById = async (req, res, next) => {
  try {
    const appointment = await Appointment.findById(req.params.id);
    if (!appointment) {
      return res.status(404).json({ message: 'Invalid appointment' });
    }
    if (!(await canAccess(appointment, req.user))) {
      return res.status(403).json({ message: 'Unauthorized access' });
    }
    const populated = await Appointment.findById(appointment._id).populate(populateAll);
    res.json(populated);
  } catch (error) {
    next(error);
  }
};

// PUT /api/appointments/:id/status
const updateAppointmentStatus = async (req, res, next) => {
  try {
    const { status } = req.body;
    const validStatuses = ['pending', 'confirmed', 'rejected', 'completed', 'cancelled'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ message: 'Invalid status' });
    }

    const appointment = await Appointment.findById(req.params.id);
    if (!appointment) {
      return res.status(404).json({ message: 'Invalid appointment' });
    }
    if (!(await canAccess(appointment, req.user))) {
      return res.status(403).json({ message: 'Unauthorized access' });
    }

    const current = appointment.status;

    if (req.user.role === 'patient') {
      if (status !== 'cancelled') {
        return res.status(403).json({ message: 'Patients can only cancel appointments' });
      }
      if (!['pending', 'confirmed'].includes(current)) {
        return res.status(400).json({ message: `Cannot cancel a ${current} appointment` });
      }
    } else if (req.user.role === 'doctor') {
      const allowed = {
        pending: ['confirmed', 'rejected'],
        confirmed: ['completed'],
      };
      if (!allowed[current] || !allowed[current].includes(status)) {
        return res.status(400).json({ message: `Cannot change status from ${current} to ${status}` });
      }
    }
    // admin can set any valid status

    appointment.status = status;
    await appointment.save();

    const populated = await Appointment.findById(appointment._id).populate(populateAll);
    res.json(populated);
  } catch (error) {
    next(error);
  }
};

// DELETE /api/appointments/:id   (admin)
const deleteAppointment = async (req, res, next) => {
  try {
    const appointment = await Appointment.findById(req.params.id);
    if (!appointment) {
      return res.status(404).json({ message: 'Invalid appointment' });
    }
    await appointment.deleteOne();
    res.json({ message: 'Appointment deleted successfully' });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createAppointment, getAppointments, getAppointmentById,
  updateAppointmentStatus, deleteAppointment,
};