import { useEffect, useState } from 'react';
import api, { getErrorMessage } from '../services/api';
import { useAuth } from '../context/AuthContext';
import Loader from '../components/Loader';
import { todayString } from '../utils/constants';

const Profile = () => {
  const { user, updateUser } = useAuth();
  const [form, setForm] = useState(null);
  const [doctorId, setDoctorId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');

  const isPatient = user.role === 'patient';
  const isDoctor = user.role === 'doctor';

  useEffect(() => {
    const load = async () => {
      try {
        const { data } = await api.get('/auth/profile');
        const u = data.user;
        const d = data.doctor;
        setForm({
          name: u.name || '',
          email: u.email || '',
          phone: u.phone || '',
          gender: u.gender || '',
          dateOfBirth: u.dateOfBirth ? u.dateOfBirth.slice(0, 10) : '',
          address: u.address || '',
          qualification: d?.qualification || '',
          experience: d?.experience ?? '',
          consultationFee: d?.consultationFee ?? '',
          bio: d?.bio || '',
          profileImage: d?.profileImage || '',
        });
        if (d) setDoctorId(d._id);
      } catch (err) {
        setError(getErrorMessage(err));
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const validate = () => {
    if (!form.name.trim()) return 'Name is required';
    if (!/^\d{10}$/.test(form.phone)) return 'Phone number must be 10 digits';
    if (isPatient && form.dateOfBirth > todayString()) return 'Date of birth cannot be in the future';
    if (isDoctor) {
      if (!form.qualification.trim()) return 'Qualification is required';
      if (form.experience === '' || Number(form.experience) < 0) return 'Enter a valid experience';
      if (form.consultationFee === '' || Number(form.consultationFee) < 0) return 'Enter a valid consultation fee';
    }
    return '';
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage('');
    const validationError = validate();
    if (validationError) return setError(validationError);

    setError('');
    setSaving(true);
    try {
      const { data } = await api.put('/auth/profile', {
        name: form.name,
        phone: form.phone,
        gender: form.gender,
        dateOfBirth: form.dateOfBirth,
        address: form.address,
      });

      if (isDoctor && doctorId) {
        await api.put(`/doctors/${doctorId}`, {
          qualification: form.qualification,
          experience: Number(form.experience),
          consultationFee: Number(form.consultationFee),
          bio: form.bio,
          profileImage: form.profileImage,
        });
      }

      updateUser(data.user);
      setMessage('Profile updated successfully.');
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <Loader />;
  if (!form) return <div className="alert alert-danger">{error}</div>;

  return (
    <div>
      <h3 className="fw-bold mb-4">My Profile</h3>

      <div className="card shadow-sm p-4" style={{ maxWidth: 800 }}>
        {error && <div className="alert alert-danger">{error}</div>}
        {message && <div className="alert alert-success">{message}</div>}

        <form onSubmit={handleSubmit}>
          <div className="row g-3">
            <div className="col-md-6">
              <label className="form-label">Full Name</label>
              <input className="form-control" name="name" value={form.name} onChange={handleChange} />
            </div>
            <div className="col-md-6">
              <label className="form-label">Email (cannot be changed)</label>
              <input className="form-control" value={form.email} disabled />
            </div>
            <div className="col-md-6">
              <label className="form-label">Phone</label>
              <input className="form-control" name="phone" maxLength="10" value={form.phone} onChange={handleChange} />
            </div>

            {isPatient && (
              <>
                <div className="col-md-3">
                  <label className="form-label">Gender</label>
                  <select className="form-select" name="gender" value={form.gender} onChange={handleChange}>
                    <option value="">Select</option>
                    <option value="male">Male</option>
                    <option value="female">Female</option>
                    <option value="other">Other</option>
                  </select>
                </div>
                <div className="col-md-3">
                  <label className="form-label">Date of Birth</label>
                  <input type="date" className="form-control" name="dateOfBirth" max={todayString()} value={form.dateOfBirth} onChange={handleChange} />
                </div>
                <div className="col-12">
                  <label className="form-label">Address</label>
                  <textarea className="form-control" rows="2" name="address" value={form.address} onChange={handleChange}></textarea>
                </div>
              </>
            )}

            {isDoctor && (
              <>
                <div className="col-md-6">
                  <label className="form-label">Qualification</label>
                  <input className="form-control" name="qualification" value={form.qualification} onChange={handleChange} />
                </div>
                <div className="col-md-6">
                  <label className="form-label">Experience (years)</label>
                  <input type="number" min="0" className="form-control" name="experience" value={form.experience} onChange={handleChange} />
                </div>
                <div className="col-md-6">
                  <label className="form-label">Consultation Fee (₹)</label>
                  <input type="number" min="0" className="form-control" name="consultationFee" value={form.consultationFee} onChange={handleChange} />
                </div>
                <div className="col-md-6">
                  <label className="form-label">Profile Image URL (optional)</label>
                  <input className="form-control" name="profileImage" value={form.profileImage} onChange={handleChange} />
                </div>
                <div className="col-12">
                  <label className="form-label">Bio</label>
                  <textarea className="form-control" rows="3" name="bio" value={form.bio} onChange={handleChange}></textarea>
                </div>
              </>
            )}
          </div>

          <button className="btn btn-primary mt-4" type="submit" disabled={saving}>
            {saving ? 'Saving...' : 'Save Changes'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default Profile;