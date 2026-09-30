import { Link } from 'react-router-dom';
import Avatar from './Avatar';

const DoctorCard = ({ doctor }) => {
  const name = doctor.userId?.name || 'Doctor';

  return (
    <div className="card doctor-card h-100 shadow-sm">
      <div className="card-body text-center">
        <Avatar name={name} image={doctor.profileImage} size={90} />
        <h5 className="mt-3 mb-1">{name}</h5>
        <span className="badge badge-soft mb-3">{doctor.specialization}</span>
        <p className="small text-muted mb-1">
          <i className="bi bi-mortarboard me-1"></i>{doctor.qualification}
        </p>
        <p className="small text-muted mb-1">
          <i className="bi bi-briefcase me-1"></i>{doctor.experience} years experience
        </p>
        <p className="fw-semibold mb-0">
          <i className="bi bi-currency-rupee"></i>{doctor.consultationFee} consultation fee
        </p>
      </div>
      <div className="card-footer bg-white border-0 pb-3 d-flex gap-2">
        <Link to={`/doctors/${doctor._id}`} className="btn btn-outline-primary btn-sm flex-fill">
          View Profile
        </Link>
        <Link to={`/patient/book/${doctor._id}`} className="btn btn-primary btn-sm flex-fill">
          Book Appointment
        </Link>
      </div>
    </div>
  );
};

export default DoctorCard;