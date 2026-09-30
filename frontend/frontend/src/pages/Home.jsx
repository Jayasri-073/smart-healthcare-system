import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import DoctorCard from '../components/DoctorCard';
import Loader from '../components/Loader';

const whyChoose = [
  { icon: 'bi-shield-check', title: 'Trusted Doctors', text: 'Qualified, experienced doctors across many specializations.' },
  { icon: 'bi-lightning-charge', title: 'Quick Booking', text: 'Book an appointment in a few clicks, anytime, on any device.' },
  { icon: 'bi-calendar-check', title: 'No Double Booking', text: 'Live slot availability makes sure your time is reserved for you.' },
  { icon: 'bi-lock', title: 'Secure & Private', text: 'Secure login and encrypted passwords protect your data.' },
];

const services = [
  { icon: 'bi-heart-pulse', name: 'Cardiologist', label: 'Cardiology' },
  { icon: 'bi-droplet', name: 'Dermatologist', label: 'Dermatology' },
  { icon: 'bi-emoji-smile', name: 'Dentist', label: 'Dentistry' },
  { icon: 'bi-thermometer-half', name: 'General Physician', label: 'General Medicine' },
  { icon: 'bi-lightning-charge', name: 'Neurologist', label: 'Neurology' },
  { icon: 'bi-emoji-laughing', name: 'Pediatrician', label: 'Pediatrics' },
  { icon: 'bi-bandaid', name: 'Orthopedic', label: 'Orthopedics' },
];

const steps = [
  { title: 'Register / Login', text: 'Create your free patient account.' },
  { title: 'Choose a Doctor', text: 'Search by name or specialization.' },
  { title: 'Pick Date & Time', text: 'Select from the available time slots.' },
  { title: 'Get Confirmed', text: 'The doctor confirms your appointment.' },
];

const Home = () => {
  const { user } = useAuth();
  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api
      .get('/doctors')
      .then(({ data }) => setDoctors(data.slice(0, 4)))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  return (
    <>
      {/* Hero */}
      <section className="hero">
        <div className="container">
          <div className="row align-items-center g-5">
            <div className="col-lg-7">
              <h1 className="display-5 mb-3">Smart Healthcare Appointment System</h1>
              <p className="lead text-muted mb-4">
                Book appointments with trusted doctors easily and manage your healthcare
                appointments in one place.
              </p>
              <div className="d-flex flex-wrap gap-3">
                <Link to="/doctors" className="btn btn-primary btn-lg">Find a Doctor</Link>
                <Link to={user ? '/doctors' : '/login'} className="btn btn-outline-primary btn-lg">
                  Book Appointment
                </Link>
              </div>
            </div>
            <div className="col-lg-5">
              <div className="card shadow-sm p-4">
                <h5 className="mb-3">Everything in one place</h5>
                <p className="mb-2"><i className="bi bi-check-circle-fill text-primary me-2"></i>Verified doctors</p>
                <p className="mb-2"><i className="bi bi-check-circle-fill text-primary me-2"></i>Instant slot booking</p>
                <p className="mb-2"><i className="bi bi-check-circle-fill text-primary me-2"></i>Track all your appointments</p>
                <p className="mb-0"><i className="bi bi-check-circle-fill text-primary me-2"></i>Simple doctor suggestions</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Why Choose Us */}
      <section className="section">
        <div className="container">
          <h2 className="text-center fw-bold mb-5">Why Choose Us</h2>
          <div className="row g-4">
            {whyChoose.map((item) => (
              <div className="col-sm-6 col-lg-3" key={item.title}>
                <div className="text-center">
                  <div className="icon-circle mb-3"><i className={`bi ${item.icon}`}></i></div>
                  <h5>{item.title}</h5>
                  <p className="text-muted small">{item.text}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Our Services */}
      <section className="section section-alt">
        <div className="container">
          <h2 className="text-center fw-bold mb-5">Our Services</h2>
          <div className="row g-4 justify-content-center">
            {services.map((s) => (
              <div className="col-6 col-md-4 col-lg-3" key={s.name}>
                <Link to={`/doctors?specialization=${encodeURIComponent(s.name)}`} className="text-decoration-none text-dark">
                  <div className="card service-card shadow-sm text-center p-3 h-100">
                    <div className="icon-circle mx-auto mb-2"><i className={`bi ${s.icon}`}></i></div>
                    <h6 className="mb-0">{s.label}</h6>
                  </div>
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Doctors */}
      <section className="section">
        <div className="container">
          <h2 className="text-center fw-bold mb-5">Featured Doctors</h2>
          {loading ? (
            <Loader />
          ) : doctors.length === 0 ? (
            <p className="text-center text-muted">No doctors available yet.</p>
          ) : (
            <div className="row g-4">
              {doctors.map((doctor) => (
                <div className="col-sm-6 col-lg-3" key={doctor._id}>
                  <DoctorCard doctor={doctor} />
                </div>
              ))}
            </div>
          )}
          <div className="text-center mt-4">
            <Link to="/doctors" className="btn btn-outline-primary">View All Doctors</Link>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="section section-alt">
        <div className="container">
          <h2 className="text-center fw-bold mb-5">How It Works</h2>
          <div className="row g-4">
            {steps.map((s, index) => (
              <div className="col-sm-6 col-lg-3 text-center" key={s.title}>
                <div className="step-number mb-3">{index + 1}</div>
                <h5>{s.title}</h5>
                <p className="text-muted small">{s.text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Contact */}
      <section className="section" id="contact">
        <div className="container text-center">
          <h2 className="fw-bold mb-4">Contact Us</h2>
          <div className="row g-4 mb-4">
            <div className="col-md-4"><i className="bi bi-envelope fs-3 text-primary"></i><p className="mb-0">support@smartcare.com</p></div>
            <div className="col-md-4"><i className="bi bi-telephone fs-3 text-primary"></i><p className="mb-0">+91 98765 43210</p></div>
            <div className="col-md-4"><i className="bi bi-geo-alt fs-3 text-primary"></i><p className="mb-0">Tamil Nadu, India</p></div>
          </div>
          <Link to="/contact" className="btn btn-primary">Send us a message</Link>
        </div>
      </section>
    </>
  );
};

export default Home;