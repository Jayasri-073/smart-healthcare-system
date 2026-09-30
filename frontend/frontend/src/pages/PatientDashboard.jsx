import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api, { getErrorMessage } from '../services/api';
import { useAuth } from '../context/AuthContext';
import StatCard from '../components/StatCard';
import AppointmentCard from '../components/AppointmentCard';
import ConfirmModal from '../components/ConfirmModal';
import Loader from '../components/Loader';
import { isUpcoming, sortByDateTime } from '../utils/constants';

const PatientDashboard = () => {
  const { user } = useAuth();
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [toCancel, setToCancel] = useState(null);
  const [cancelling, setCancelling] = useState(false);

  useEffect(() => {
    const load = async () => {
      try {
        const { data } = await api.get('/appointments');
        setAppointments(data);
      } catch (err) {
        setError(getErrorMessage(err));
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const handleCancel = async () => {
    setCancelling(true);
    try {
      const { data } = await api.put(`/appointments/${toCancel._id}/status`, { status: 'cancelled' });
      setAppointments((prev) => prev.map((a) => (a._id === data._id ? data : a)));
      setMessage('Appointment cancelled successfully.');
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setCancelling(false);
      setToCancel(null);
    }
  };

  if (loading) return <Loader />;

  const upcoming = sortByDateTime(appointments.filter(isUpcoming));
  const completed = appointments.filter((a) => a.status === 'completed').length;
  const cancelled = appointments.filter((a) => a.status === 'cancelled').length;

  return (
    <div>
      <div className="d-flex flex-wrap justify-content-between align-items-center mb-4 gap-2">
        <div>
          <h3 className="fw-bold mb-0">Welcome, {user.name}!</h3>
          <p className="text-muted mb-0">Here is a summary of your appointments.</p>
        </div>
        <Link to="/doctors" className="btn btn-primary">
          <i className="bi bi-plus-lg"></i> Book New Appointment
        </Link>
      </div>

      {error && <div className="alert alert-danger">{error}</div>}
      {message && <div className="alert alert-success">{message}</div>}

      <div className="row g-3 mb-4">
        <div className="col-6 col-lg-3"><StatCard icon="bi-calendar-check" label="Total Appointments" value={appointments.length} /></div>
        <div className="col-6 col-lg-3"><StatCard icon="bi-hourglass-split" label="Upcoming" value={upcoming.length} color="warning" /></div>
        <div className="col-6 col-lg-3"><StatCard icon="bi-check2-all" label="Completed" value={completed} color="success" /></div>
        <div className="col-6 col-lg-3"><StatCard icon="bi-x-circle" label="Cancelled" value={cancelled} color="secondary" /></div>
      </div>

      <h5 className="fw-bold mb-3">Upcoming Appointments</h5>
      {upcoming.length === 0 ? (
        <div className="card shadow-sm p-4 text-center text-muted">
          You have no upcoming appointments.{' '}
          <Link to="/doctors">Find a doctor</Link> to book one.
        </div>
      ) : (
        <div className="row g-3">
          {upcoming.map((appointment) => (
            <div className="col-md-6 col-xl-4" key={appointment._id}>
              <AppointmentCard appointment={appointment} onCancel={setToCancel} />
            </div>
          ))}
        </div>
      )}

      <ConfirmModal
        show={!!toCancel}
        title="Cancel Appointment"
        message="Are you sure you want to cancel this appointment?"
        confirmText="Yes, cancel it"
        loading={cancelling}
        onConfirm={handleCancel}
        onClose={() => setToCancel(null)}
      />
    </div>
  );
};

export default PatientDashboard;