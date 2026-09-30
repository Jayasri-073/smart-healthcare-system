const About = () => (
  <div className="container py-5">
    <h2 className="fw-bold mb-3">About SmartCare</h2>
    <p className="text-muted">
      SmartCare is a Smart Healthcare Appointment &amp; Management System. It connects patients with
      doctors and removes the hassle of waiting in queues or calling clinics. Patients can search
      for doctors, check available time slots and book appointments online. Doctors manage their
      availability and appointments, and administrators oversee the whole system.
    </p>
    <div className="row g-4 mt-2">
      <div className="col-md-4">
        <div className="card shadow-sm h-100 p-3">
          <h5><i className="bi bi-bullseye me-2 text-primary"></i>Our Mission</h5>
          <p className="text-muted small mb-0">Make booking healthcare appointments simple, fast and reliable for everyone.</p>
        </div>
      </div>
      <div className="col-md-4">
        <div className="card shadow-sm h-100 p-3">
          <h5><i className="bi bi-eye me-2 text-primary"></i>Our Vision</h5>
          <p className="text-muted small mb-0">A connected healthcare experience where every patient finds the right doctor quickly.</p>
        </div>
      </div>
      <div className="col-md-4">
        <div className="card shadow-sm h-100 p-3">
          <h5><i className="bi bi-shield-check me-2 text-primary"></i>Our Promise</h5>
          <p className="text-muted small mb-0">Secure accounts, no double bookings and clear appointment tracking.</p>
        </div>
      </div>
    </div>
  </div>
);

export default About;