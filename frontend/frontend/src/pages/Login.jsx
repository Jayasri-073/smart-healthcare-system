import { useState } from 'react';
import { Link, Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { getErrorMessage } from '../services/api';
import { dashboardPath } from '../utils/constants';

const Login = () => {
  const { user, login } = useAuth();
  const location = useLocation();
  const [form, setForm] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // Already logged in (or just logged in): go to the page they wanted, or their dashboard
  if (user) {
    const from = location.state?.from?.pathname;
    return <Navigate to={from || dashboardPath(user.role)} replace />;
  }

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.email.trim() || !form.password) {
      return setError('Email and password are required');
    }
    setError('');
    setLoading(true);
    try {
      await login(form.email.trim(), form.password);
    } catch (err) {
      setError(getErrorMessage(err));
      setLoading(false);
    }
  };

  return (
    <div className="auth-wrapper">
      <div className="container">
        <div className="row justify-content-center">
          <div className="col-md-6 col-lg-5">
            <div className="card shadow-sm p-4">
              <h3 className="fw-bold mb-1">Welcome back</h3>
              <p className="text-muted">Login to manage your appointments</p>

              {error && <div className="alert alert-danger">{error}</div>}

              <form onSubmit={handleSubmit}>
                <div className="mb-3">
                  <label className="form-label">Email</label>
                  <input type="email" name="email" className="form-control" value={form.email} onChange={handleChange} />
                </div>
                <div className="mb-3">
                  <label className="form-label">Password</label>
                  <input type="password" name="password" className="form-control" value={form.password} onChange={handleChange} />
                </div>
                <button className="btn btn-primary w-100" type="submit" disabled={loading}>
                  {loading ? 'Logging in...' : 'Login'}
                </button>
              </form>

              <p className="text-center mt-3 mb-0">
                New patient? <Link to="/register">Create an account</Link>
              </p>

              <div className="alert alert-light border small mt-3 mb-0">
                <strong>Demo logins (from the seed script)</strong><br />
                Patient: patient@test.com / patient123<br />
                Doctor: arun@healthcare.com / doctor123<br />
                Admin: admin@healthcare.com / admin123
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;