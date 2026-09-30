import { Link } from 'react-router-dom';
import StatusBadge from './StatusBadge';
import { formatDate, isUpcoming } from '../utils/constants';

const AppointmentCard = ({ appointment, onCancel }) => {
  const doctorName = appointment.doctorId?.userId?.name || 'Doctor';

  return (
    <div className="card shadow-sm h-100">
      <div className="card-body">
        <div className="d-flex justify-content-between align-items-start mb-2">
          <div>
            <h6 className="mb-0">{doctorName}</h6>
            <small className="text-muted">{appointment.doctorId?.specialization}</small>
          </div>
          <StatusBadge status={appointment.status} />
        </div>
        <p className="small mb-1">
          <i className="bi bi-calendar-event me-2"></i>{formatDate(appointment.appointmentDate)}
        </p>
        <p className="small mb-1">
          <i className="bi bi-clock me-2"></i>{appointment.appointmentTime}
        </p>
        <p className="small text-muted mb-3">
          <strong>Reason:</strong> {appointment.reason}
        </p>
        <div className="d-flex gap-2">
          <Link to={`/patient/appointments/${appointment._id}`} className="btn btn-outline-primary btn-sm">
            Details
          </Link>
          {onCancel && isUpcoming(appointment) && (
            <button className="btn btn-outline-danger btn-sm" onClick={() => onCancel(appointment)}>
              Cancel
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default AppointmentCard;