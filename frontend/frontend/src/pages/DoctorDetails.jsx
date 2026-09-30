import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import api, { getErrorMessage } from '../services/api';
import Avatar from '../components/Avatar';
import Loader from '../components/Loader';
import { to12Hour } from '../utils/constants';

const DoctorDetails = () => {
  const { id } = useParams();
  const [doctor, setDoctor] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const load = async () => {
      try {
        const { data } = await api.get(`/doctors/${id}`);
        setDoctor(data);
      } catch (err) {
        setError(getErrorMessage(err));
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [id]);

  if (loading) return <Loader />;

  if (error) {
    return (
      <div className="container py-5">
        <div className="alert alert-danger">{error}</div>
        <Link to="/doctors" className="btn btn-outline-primary">Back to Doctors</Link>
      </div>
    );
  }

  const name = doctor.userId?.name || 'Doctor';

  return (
    <div className="container py-5">
      <Link to="/doctors" className="text-decoration-none">
        <i className="bi bi-arrow-left"></i> Back to Doctors
      </Link>

      <div className="card shadow-sm p-4 mt-3">
        <div className="row g-4">
          <div className="col-md-4 text-center">
            <Avatar name={name} image={doctor.profileImage} size={140} />
            <h4 className="mt-3 mb-1">{name}</h4>
            <span className="badge badge-soft">{doctor.specialization}</span>
          </div>
          <div className="col-md-8">
            {!doctor.isActive && (
              <div className="alert alert-warning">This doctor is currently not accepting appointments.</div>
            )}
            <div className="row g-3 mb-3">
              <div className="col-sm-6"><i className="bi bi-mortarboard text-primary me-2"></i>{doctor.qualification}</div>
              <div className="col-sm-6"><i className="bi bi-briefcase text-primary me-2"></i>{doctor.experience} years experience</div>
              <div className="col-sm-6"><i className="bi bi-currency-rupee text-primary me-2"></i>{doctor.consultationFee} consultation fee</div>
              <div className="col-sm-6">
                <i className="bi bi-clock text-primary me-2"></i>
                {to12Hour(doctor.availableTime.start)} - {to12Hour(doctor.availableTime.end)}
              </div>
            </div>

            <h6>About</h6>
            <p className="text-muted">{doctor.bio || 'No biography added yet.'}</p>

            <h6>Available Days</h6>
            <div className="mb-4">
              {doctor.availableDays.map((day) => (
                <span key={day} className="badge badge-soft me-1 mb-1">{day}</span>
              ))}
            </div>

            {doctor.isActive && (
              <Link to={`/patient/book/${doctor._id}`} className="btn btn-primary">
                <i className="bi bi-calendar-plus me-1"></i> Book Appointment
              </Link>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default DoctorDetails;