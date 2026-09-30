import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import api, { getErrorMessage } from '../services/api';
import StatusBadge from '../components/StatusBadge';
import ConfirmModal from '../components/ConfirmModal';
import Loader from '../components/Loader';
import { formatDate, isUpcoming } from '../utils/constants';

const AppointmentDetails = () => {
  const { id } = useParams();
  const [appointment, setAppointment] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [showCancel, setShowCancel] = useState(false);
  const [cancelling, setCancelling] = useState(false);

  useEffect(() => {
    const load = async () => {
      try {
        const { data } = await api.get(`/appointments/${id}`);
        setAppointment(data);
      } catch (err) {
        setError(getErrorMessage(err));
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [id]);

  const handleCancel = async () => {
    setCancelling(true);
    try {
      const { data } = await api.put(`/appointments/${id}/status`, { status: 'cancelled' });
      setAppointment(data);
      setMessage('Appointment cancelled successfully.');
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setCancelling(false);
      setShowCancel(false);
    }
  };

  if (loading) return <Loader />;

  if (!appointment) {
    return (
      <div>
        <div className="alert alert-danger">{error || 'Invalid appointment'}</div>
        <Link to="/patient/appointments" className="btn btn-outline-primary">Back to My Appointments</Link>
      </div>
    );
  }

  const doctor = appointment.doctorId;

  return (
    <div>
      <Link to="/patient/appointments" className="text-decoration-none">
        <i className="bi bi-arrow-left"></i> Back to My Appointments
      </Link>
      <h3 className="fw-bold my-3">Appointment Details</h3>

      {error && <div className="alert alert-danger">{error}</div>}
      {message && <div className="alert alert-success">{message}</div>}

      <div className="card shadow-sm p-4">
        <div className="d-flex justify-content-between align-items-center mb-3">
          <h5 className="mb-0">{doctor?.userId?.name || 'Doctor'}</h5>
          <StatusBadge status={appointment.status} />
        </div>
        <div className="row g-3">
          <div className="col-sm-6"><strong>Specialization:</strong> {doctor?.specialization}</div>
          <div className="col-sm-6"><strong>Consultation Fee:</strong> ₹{doctor?.consultationFee}</div>
          <div className="col-sm-6"><strong>Date:</strong> {formatDate(appointment.appointmentDate)}</div>
          <div className="col-sm-6"><strong>Time:</strong> {appointment.appointmentTime}</div>
          <div className="col-sm-6"><strong>Doctor Email:</strong> {doctor?.userId?.email}</div>
          <div className="col-sm-6"><strong>Doctor Phone:</strong> {doctor?.userId?.phone}</div>
          <div className="col-12"><strong>Reason:</strong> {appointment.reason}</div>
          <div className="col-12 text-muted small">
            Booked on {new Date(appointment.createdAt).toLocaleString('en-IN')}
          </div>
        </div>

        {isUpcoming(appointment) && (
          <div className="mt-4">
            <button className="btn btn-outline-danger" onClick={() => setShowCancel(true)}>
              Cancel Appointment
            </button>
          </div>
        )}
      </div>

      <ConfirmModal
        show={showCancel}
        title="Cancel Appointment"
        message="Are you sure you want to cancel this appointment?"
        confirmText="Yes, cancel it"
        loading={cancelling}
        onConfirm={handleCancel}
        onClose={() => setShowCancel(false)}
      />
    </div>
  );
};

export default AppointmentDetails;