import { useState } from 'react';
import { Link, Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { getErrorMessage } from '../services/api';
import { dashboardPath, todayString } from '../utils/constants';

const initialForm = {
  name: '', email: '', password: '', confirmPassword: '',
  phone: '', gender: '', dateOfBirth: '', address: '',
};

const Register = () => {
  const { user, register } = useAuth();
  const [form, setForm] = useState(initialForm);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  if (user) return <Navigate to={dashboardPath(user.role)} replace />;

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const validate = () => {
    if (!form.name.trim()) return 'Full name is required';
    if (!/^\S+@\S+\.\S+$/.test(form.email)) return 'Please enter a valid email address';
    if (form.password.length < 6) return 'Password must be at least 6 characters';
    if (form.password !== form.confirmPassword) return 'Passwords do not match';
    if (!/^\d{10}$/.test(form.phone)) return 'Phone number must be 10 digits';
    if (!form.gender) return 'Please select your gender';
    if (!form.dateOfBirth) return 'Date of birth is required';
    if (form.dateOfBirth > todayString()) return 'Date of birth cannot be in the future';
    if (!form.address.trim()) return 'Address is required';
    return '';
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const validationError = validate();
    if (validationError) return setError(validationError);

    setError('');
    setLoading(true);
    try {
      await register(form);
    } catch (err) {
      setError(getErrorMessage(err));
      setLoading(false);
    }
  };

  return (
    <div className="auth-wrapper">
      <div className="container">
        <div className="row justify-content-center">
          <div className="col-lg-8">
            <div className="card shadow-sm p-4">
              <h3 className="fw-bold mb-1">Create your patient account</h3>
              <p className="text-muted">Register to book appointments with doctors</p>

              {error && <div className="alert alert-danger">{error}</div>}

              <form onSubmit={handleSubmit}>
                <div className="row g-3">
                  <div className="col-md-6">
                    <label className="form-label">Full Name</label>
                    <input className="form-control" name="name" value={form.name} onChange={handleChange} />
                  </div>
                  <div className="col-md-6">
                    <label className="form-label">Email</label>
                    <input type="email" className="form-control" name="email" value={form.email} onChange={handleChange} />
                  </div>
                  <div className="col-md-6">
                    <label className="form-label">Password</label>
                    <input type="password" className="form-control" name="password" value={form.password} onChange={handleChange} />
                  </div>
                  <div className="col-md-6">
                    <label className="form-label">Confirm Password</label>
                    <input type="password" className="form-control" name="confirmPassword" value={form.confirmPassword} onChange={handleChange} />
                  </div>
                  <div className="col-md-4">
                    <label className="form-label">Phone</label>
                    <input className="form-control" name="phone" maxLength="10" value={form.phone} onChange={handleChange} />
                  </div>
                  <div className="col-md-4">
                    <label className="form-label">Gender</label>
                    <select className="form-select" name="gender" value={form.gender} onChange={handleChange}>
                      <option value="">Select</option>
                      <option value="male">Male</option>
                      <option value="female">Female</option>
                      <option value="other">Other</option>
                    </select>
                  </div>
                  <div className="col-md-4">
                    <label className="form-label">Date of Birth</label>
                    <input type="date" className="form-control" name="dateOfBirth" max={todayString()} value={form.dateOfBirth} onChange={handleChange} />
                  </div>
                  <div className="col-12">
                    <label className="form-label">Address</label>
                    <textarea className="form-control" rows="2" name="address" value={form.address} onChange={handleChange}></textarea>
                  </div>
                </div>
                <button className="btn btn-primary w-100 mt-4" type="submit" disabled={loading}>
                  {loading ? 'Creating account...' : 'Register'}
                </button>
              </form>

              <p className="text-center mt-3 mb-0">
                Already have an account? <Link to="/login">Login</Link>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Register;