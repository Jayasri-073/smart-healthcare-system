import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import api, { getErrorMessage } from '../services/api';
import Avatar from '../components/Avatar';
import Loader from '../components/Loader';
import Modal from '../components/Modal';
import { formatDate, todayString } from '../utils/constants';

const BookAppointment = () => {
  const { doctorId } = useParams();
  const navigate = useNavigate();

  const [doctor, setDoctor] = useState(null);
  const [loading, setLoading] = useState(true);
  const [pageError, setPageError] = useState('');

  const [date, setDate] = useState('');
  const [slots, setSlots] = useState([]);
  const [slotsLoading, setSlotsLoading] = useState(false);
  const [time, setTime] = useState('');
  const [reason, setReason] = useState('');

  const [error, setError] = useState('');
  const [showConfirm, setShowConfirm] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const load = async () => {
      try {
        const { data } = await api.get(`/doctors/${doctorId}`);
        setDoctor(data);
      } catch (err) {
        setPageError(getErrorMessage(err));
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [doctorId]);

  const loadSlots = async (selectedDate) => {
    setSlotsLoading(true);
    try {
      const { data } = await api.get(`/doctors/${doctorId}/slots`, { params: { date: selectedDate } });
      setSlots(data.slots);
    } catch (err) {
      setError(getErrorMessage(err));
      setSlots([]);
    } finally {
      setSlotsLoading(false);
    }
  };

  const handleDateChange = (e) => {
    const value = e.target.value;
    setDate(value);
    setTime('');
    setError('');
    setSlots([]);
    if (!value) return;
    if (value < todayString()) {
      setError('Appointment date cannot be in the past');
      return;
    }
    loadSlots(value);
  };

  const handleReview = (e) => {
    e.preventDefault();
    if (!date) return setError('Please select a date');
    if (!time) return setError('Please select a time slot');
    if (!reason.trim()) return setError('Please enter the reason for your visit');
    setError('');
    setShowConfirm(true);
  };

  const handleConfirm = async () => {
    setSubmitting(true);
    try {
      await api.post('/appointments', {
        doctorId,
        appointmentDate: date,
        appointmentTime: time,
        reason,
      });
      navigate('/patient/appointments', {
        state: { message: 'Appointment booked successfully! Waiting for the doctor to confirm.' },
      });
    } catch (err) {
      // e.g. "Appointment slot already booked" -> refresh the slots so the patient can pick another
      setShowConfirm(false);
      setError(getErrorMessage(err));
      setTime('');
      loadSlots(date);
      setSubmitting(false);
    }
  };

  if (loading) return <Loader />;

  if (pageError) {
    return (
      <div>
        <div className="alert alert-danger">{pageError}</div>
        <Link to="/doctors" className="btn btn-outline-primary">Back to Doctors</Link>
      </div>
    );
  }

  const doctorName = doctor.userId?.name || 'Doctor';

  return (
    <div>
      <h3 className="fw-bold mb-4">Book Appointment</h3>

      <div className="row g-4">
        {/* Doctor summary */}
        <div className="col-lg-4">
          <div className="card shadow-sm text-center p-4">
            <Avatar name={doctorName} image={doctor.profileImage} size={90} />
            <h5 className="mt-3 mb-1">{doctorName}</h5>
            <span className="badge badge-soft mb-2">{doctor.specialization}</span>
            <p className="small text-muted mb-1">{doctor.qualification}</p>
            <p className="fw-semibold mb-2">
              <i className="bi bi-currency-rupee"></i>{doctor.consultationFee} consultation fee
            </p>
            <small className="text-muted">Available: {doctor.availableDays.join(', ')}</small>
          </div>
        </div>

        {/* Booking form */}
        <div className="col-lg-8">
          <div className="card shadow-sm p-4">
            {error && <div className="alert alert-danger">{error}</div>}

            <form onSubmit={handleReview}>
              <div className="mb-3">
                <label className="form-label fw-semibold">1. Select Date</label>
                <input
                  type="date"
                  className="form-control"
                  min={todayString()}
                  value={date}
                  onChange={handleDateChange}
                />
              </div>

              <div className="mb-3">
                <label className="form-label fw-semibold">2. Select Time Slot</label>
                {!date && <p className="text-muted small">Please select a date to see available slots.</p>}
                {slotsLoading && <Loader text="Loading slots..." />}
                {date && !slotsLoading && slots.length === 0 && !error && (
                  <div className="alert alert-warning mb-0">
                    No slots available on this date. The doctor is available on:{' '}
                    {doctor.availableDays.join(', ')}.
                  </div>
                )}
                <div className="d-flex flex-wrap gap-2">
                  {slots.map((slot) => (
                    <button
                      type="button"
                      key={slot.time}
                      disabled={slot.isBooked}
                      className={`btn btn-sm ${
                        time === slot.time ? 'btn-primary' : slot.isBooked ? 'btn-outline-secondary' : 'btn-outline-primary'
                      }`}
                      onClick={() => setTime(slot.time)}
                    >
                      {slot.time}
                      {slot.isBooked && ' (Booked)'}
                    </button>
                  ))}
                </div>
              </div>

              <div className="mb-4">
                <label className="form-label fw-semibold">3. Reason for Visit</label>
                <textarea
                  className="form-control"
                  rows="3"
                  placeholder="Briefly describe your problem"
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                ></textarea>
              </div>

              <button className="btn btn-primary" type="submit">Review &amp; Confirm</button>
            </form>
          </div>
        </div>
      </div>

      {/* Confirmation modal */}
      <Modal
        show={showConfirm}
        title="Confirm Appointment"
        onClose={() => !submitting && setShowConfirm(false)}
        footer={
          <>
            <button className="btn btn-secondary" onClick={() => setShowConfirm(false)} disabled={submitting}>
              Go Back
            </button>
            <button className="btn btn-primary" onClick={handleConfirm} disabled={submitting}>
              {submitting ? 'Booking...' : 'Confirm Appointment'}
            </button>
          </>
        }
      >
        <p className="mb-1"><strong>Doctor:</strong> {doctorName} ({doctor.specialization})</p>
        <p className="mb-1"><strong>Date:</strong> {date && formatDate(date)}</p>
        <p className="mb-1"><strong>Time:</strong> {time}</p>
        <p className="mb-1"><strong>Fee:</strong> ₹{doctor.consultationFee}</p>
        <p className="mb-0"><strong>Reason:</strong> {reason}</p>
      </Modal>
    </div>
  );
};

export default BookAppointment;