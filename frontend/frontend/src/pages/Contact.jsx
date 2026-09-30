import { useState } from 'react';

const Contact = () => {
  const [form, setForm] = useState({ name: '', email: '', message: '' });
  const [sent, setSent] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  // Demo only: the message is not sent to a server
  const handleSubmit = (e) => {
    e.preventDefault();
    if (!form.name.trim() || !form.message.trim()) return setError('Please fill in all fields');
    if (!/^\S+@\S+\.\S+$/.test(form.email)) return setError('Please enter a valid email address');
    setError('');
    setSent(true);
    setForm({ name: '', email: '', message: '' });
  };

  return (
    <div className="container py-5">
      <h2 className="fw-bold mb-4">Contact Us</h2>
      <div className="row g-4">
        <div className="col-md-5">
          <p><i className="bi bi-envelope text-primary me-2"></i>support@smartcare.com</p>
          <p><i className="bi bi-telephone text-primary me-2"></i>+91 98765 43210</p>
          <p><i className="bi bi-geo-alt text-primary me-2"></i>Tamil Nadu, India</p>
        </div>
        <div className="col-md-7">
          <div className="card shadow-sm p-4">
            {sent && <div className="alert alert-success">Thank you! We will get back to you soon.</div>}
            {error && <div className="alert alert-danger">{error}</div>}
            <form onSubmit={handleSubmit}>
              <div className="mb-3">
                <label className="form-label">Name</label>
                <input className="form-control" name="name" value={form.name} onChange={handleChange} />
              </div>
              <div className="mb-3">
                <label className="form-label">Email</label>
                <input className="form-control" name="email" value={form.email} onChange={handleChange} />
              </div>
              <div className="mb-3">
                <label className="form-label">Message</label>
                <textarea className="form-control" rows="4" name="message" value={form.message} onChange={handleChange}></textarea>
              </div>
              <button className="btn btn-primary" type="submit">Send Message</button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Contact;