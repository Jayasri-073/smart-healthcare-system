import { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import api, { getErrorMessage } from '../services/api';
import AppointmentCard from '../components/AppointmentCard';
import ConfirmModal from '../components/ConfirmModal';
import Loader from '../components/Loader';
import { isUpcoming, sortByDateTime } from '../utils/constants';

const MyAppointments = () => {
  const location = useLocation();
  const [appointments, setAppointments] = useState([]);
  const [tab, setTab] = useState('upcoming');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [message, setMessage] = useState(location.state?.message || '');
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

  const list =
    tab === 'upcoming'
      ? sortByDateTime(appointments.filter(isUpcoming))
      : sortByDateTime(appointments.filter((a) => !isUpcoming(a)), 'desc');

  return (
    <div>
      <h3 className="fw-bold mb-4">My Appointments</h3>

      {error && <div className="alert alert-danger">{error}</div>}
      {message && <div className="alert alert-success">{message}</div>}

      <ul className="nav nav-pills mb-4 gap-2">
        <li className="nav-item">
          <button className={`btn btn-sm ${tab === 'upcoming' ? 'btn-primary' : 'btn-outline-primary'}`} onClick={() => setTab('upcoming')}>
            Upcoming
          </button>
        </li>
        <li className="nav-item">
          <button className={`btn btn-sm ${tab === 'history' ? 'btn-primary' : 'btn-outline-primary'}`} onClick={() => setTab('history')}>
            History
          </button>
        </li>
      </ul>

      {list.length === 0 ? (
        <div className="card shadow-sm p-4 text-center text-muted">
          {tab === 'upcoming' ? 'No upcoming appointments.' : 'No appointment history yet.'}
        </div>
      ) : (
        <div className="row g-3">
          {list.map((appointment) => (
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

export default MyAppointments;