const Appointment = require('../models/Appointment');

const pad = (n) => String(n).padStart(2, '0');

const getTodayString = () => {
  const d = new Date();
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
};

const isValidDateString = (s) =>
  typeof s === 'string' &&
  /^\d{4}-\d{2}-\d{2}$/.test(s) &&
  !isNaN(new Date(`${s}T00:00:00`).getTime());

const getDayName = (s) =>
  new Date(`${s}T00:00:00`).toLocaleDateString('en-US', { weekday: 'long' });

const toMinutes = (t) => {
  const [h, m] = t.split(':').map(Number);
  return h * 60 + m;
};

const formatTime = (mins) => {
  const h24 = Math.floor(mins / 60);
  const m = mins % 60;
  const ampm = h24 >= 12 ? 'PM' : 'AM';
  const h12 = h24 % 12 || 12;
  return `${pad(h12)}:${pad(m)} ${ampm}`;
};

// Returns [{ time: '10:00 AM', isBooked: false }, ...] for a doctor on a date
const getSlotsForDate = async (doctor, date, duration = 30) => {
  if (!doctor.availableDays.includes(getDayName(date))) return [];

  const booked = await Appointment.find({
    doctorId: doctor._id,
    appointmentDate: date,
    status: { $in: ['pending', 'confirmed'] },
  }).select('appointmentTime');
  const bookedTimes = booked.map((a) => a.appointmentTime);

  const start = toMinutes(doctor.availableTime.start);
  const end = toMinutes(doctor.availableTime.end);
  const now = new Date();
  const isToday = date === getTodayString();
  const nowMinutes = now.getHours() * 60 + now.getMinutes();

  const slots = [];
  for (let m = start; m + duration <= end; m += duration) {
    if (isToday && m <= nowMinutes) continue; // skip past times today
    const time = formatTime(m);
    slots.push({ time, isBooked: bookedTimes.includes(time) });
  }
  return slots;
};

module.exports = { getTodayString, isValidDateString, getDayName, getSlotsForDate };