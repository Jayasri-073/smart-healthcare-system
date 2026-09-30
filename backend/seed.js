const dotenv = require('dotenv');
dotenv.config();

const connectDB = require('./config/db');
const User = require('./models/User');
const Doctor = require('./models/Doctor');
const Appointment = require('./models/Appointment');

const pad = (n) => String(n).padStart(2, '0');
const dateFromToday = (days) => {
  const d = new Date();
  d.setDate(d.getDate() + days);
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
};

const doctorsData = [
  { name: 'Dr. Arun Kumar', email: 'arun@healthcare.com', phone: '9876543210', gender: 'male',
    specialization: 'Cardiologist', qualification: 'MBBS, MD (Cardiology)', experience: 12, consultationFee: 800,
    bio: 'Experienced cardiologist specialising in heart disease prevention and treatment.' },
  { name: 'Dr. Priya Sharma', email: 'priya@healthcare.com', phone: '9876543211', gender: 'female',
    specialization: 'Dermatologist', qualification: 'MBBS, MD (Dermatology)', experience: 8, consultationFee: 600,
    bio: 'Skin and hair specialist with a focus on acne and allergy treatment.' },
  { name: 'Dr. Ravi Kumar', email: 'ravi@healthcare.com', phone: '9876543212', gender: 'male',
    specialization: 'General Physician', qualification: 'MBBS', experience: 10, consultationFee: 400,
    bio: 'General physician for fever, infections and routine health check-ups.' },
  { name: 'Dr. Meena Raj', email: 'meena@healthcare.com', phone: '9876543213', gender: 'female',
    specialization: 'Pediatrician', qualification: 'MBBS, DCH', experience: 9, consultationFee: 500,
    bio: 'Caring pediatrician for infants, children and adolescents.' },
  { name: 'Dr. Karthik S', email: 'karthik@healthcare.com', phone: '9876543214', gender: 'male',
    specialization: 'Orthopedic', qualification: 'MBBS, MS (Ortho)', experience: 11, consultationFee: 700,
    bio: 'Orthopedic surgeon for bone, joint and sports injuries.' },
];

const seed = async () => {
  await connectDB();

  if (process.argv.includes('--doctors-only')) {
    let added = 0;
    let skipped = 0;

    for (const d of doctorsData) {
      let user = await User.findOne({ email: d.email });
      if (user && user.role !== 'doctor') {
        console.warn(`Skipped ${d.email}: email is already used by a non-doctor account`);
        skipped += 1;
        continue;
      }

      if (!user) {
        user = await User.create({
          name: d.name, email: d.email, password: 'doctor123',
          phone: d.phone, gender: d.gender, role: 'doctor',
        });
      }

      const existingDoctor = await Doctor.findOne({ userId: user._id });
      if (existingDoctor) {
        skipped += 1;
        continue;
      }

      await Doctor.create({
        userId: user._id,
        specialization: d.specialization,
        qualification: d.qualification,
        experience: d.experience,
        consultationFee: d.consultationFee,
        bio: d.bio,
        availableDays: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'],
        availableTime: { start: '09:00', end: '17:00' },
      });
      added += 1;
    }

    console.log(`Doctor data inserted: ${added} added, ${skipped} skipped`);
    process.exit(0);
  }

  await Appointment.deleteMany();
  await Doctor.deleteMany();
  await User.deleteMany();

  await User.create({
    name: 'System Admin', email: 'admin@healthcare.com', password: 'admin123',
    phone: '9000000000', role: 'admin',
  });

  const doctors = [];
  for (const d of doctorsData) {
    const user = await User.create({
      name: d.name, email: d.email, password: 'doctor123',
      phone: d.phone, gender: d.gender, role: 'doctor',
    });
    const doctor = await Doctor.create({
      userId: user._id,
      specialization: d.specialization,
      qualification: d.qualification,
      experience: d.experience,
      consultationFee: d.consultationFee,
      bio: d.bio,
      availableDays: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'],
      availableTime: { start: '09:00', end: '17:00' },
    });
    doctors.push(doctor);
  }

  const patient = await User.create({
    name: 'Test Patient', email: 'patient@test.com', password: 'patient123',
    phone: '9123456780', gender: 'female', dateOfBirth: '2000-05-15', address: 'Chennai, Tamil Nadu',
    role: 'patient',
  });

  await Appointment.create([
    { patientId: patient._id, doctorId: doctors[0]._id, appointmentDate: dateFromToday(1),
      appointmentTime: '10:00 AM', reason: 'Chest discomfort check-up', status: 'pending' },
    { patientId: patient._id, doctorId: doctors[1]._id, appointmentDate: dateFromToday(2),
      appointmentTime: '11:00 AM', reason: 'Skin allergy', status: 'confirmed' },
    { patientId: patient._id, doctorId: doctors[2]._id, appointmentDate: dateFromToday(-3),
      appointmentTime: '09:30 AM', reason: 'Fever and cold', status: 'completed' },
  ]);

  console.log('Sample data inserted successfully');
  console.log('Admin   -> admin@healthcare.com / admin123');
  console.log('Doctor  -> arun@healthcare.com / doctor123');
  console.log('Patient -> patient@test.com / patient123');
  process.exit(0);
};

seed().catch((err) => {
  console.error(err);
  process.exit(1);
});