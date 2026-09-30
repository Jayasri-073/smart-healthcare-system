export const SPECIALIZATIONS = [
  'Cardiologist',
  'Dermatologist',
  'Dentist',
  'General Physician',
  'Neurologist',
  'Pediatrician',
  'Orthopedic',
];

// Rule-based recommendation: symptom category -> specialization
export const SYMPTOM_CATEGORIES = [
  { label: 'Heart-related', specialization: 'Cardiologist' },
  { label: 'Skin problem', specialization: 'Dermatologist' },
  { label: 'Dental problem', specialization: 'Dentist' },
  { label: 'Bone/joint pain', specialization: 'Orthopedic' },
  { label: 'Child health', specialization: 'Pediatrician' },
  { label: 'General illness', specialization: 'General Physician' },
  { label: 'Neurological problem', specialization: 'Neurologist' },
];

export const WEEK_DAYS = [
  'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday',
];

export const dashboardPath = (role) => {
  if (role === 'admin') return '/admin/dashboard';
  if (role === 'doctor') return '/doctor/dashboard';
  return '/patient/dashboard';
};

const pad = (n) => String(n).padStart(2, '0');

// Today's date as "YYYY-MM-DD" (local time)
export const todayString = () => {
  const d = new Date();
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
};

export const formatDate = (dateString) =>
  new Date(`${dateString}T00:00:00`).toLocaleDateString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });

// "14:30" -> "02:30 PM"
export const to12Hour = (time) => {
  const [h, m] = time.split(':').map(Number);
  return `${pad(h % 12 || 12)}:${pad(m)} ${h >= 12 ? 'PM' : 'AM'}`;
};

// "02:30 PM" -> 870 (minutes since midnight)
export const timeToMinutes = (time) => {
  const [clock, period] = time.split(' ');
  let [h, m] = clock.split(':').map(Number);
  if (period === 'PM' && h !== 12) h += 12;
  if (period === 'AM' && h === 12) h = 0;
  return h * 60 + m;
};

export const sortByDateTime = (list, direction = 'asc') => {
  const factor = direction === 'asc' ? 1 : -1;
  return [...list].sort((a, b) => {
    if (a.appointmentDate !== b.appointmentDate) {
      return a.appointmentDate.localeCompare(b.appointmentDate) * factor;
    }
    return (timeToMinutes(a.appointmentTime) - timeToMinutes(b.appointmentTime)) * factor;
  });
};

// An appointment is "upcoming" (and cancellable) if it is pending/confirmed and not in the past
export const isUpcoming = (appointment) =>
  ['pending', 'confirmed'].includes(appointment.status) &&
  appointment.appointmentDate >= todayString();