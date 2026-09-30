import { NavLink } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const menus = {
  patient: [
    { to: '/patient/dashboard', icon: 'bi-speedometer2', label: 'Dashboard' },
    { to: '/doctors', icon: 'bi-search', label: 'Find Doctors' },
    { to: '/patient/appointments', icon: 'bi-calendar-check', label: 'My Appointments' },
    { to: '/patient/profile', icon: 'bi-person-circle', label: 'My Profile' },
  ],
  doctor: [
    { to: '/doctor/dashboard', icon: 'bi-speedometer2', label: 'Dashboard' },
    { to: '/doctor/appointments', icon: 'bi-calendar-check', label: 'Appointments' },
    { to: '/doctor/availability', icon: 'bi-clock', label: 'Availability' },
    { to: '/doctor/profile', icon: 'bi-person-circle', label: 'My Profile' },
  ],
  admin: [
    { to: '/admin/dashboard', icon: 'bi-speedometer2', label: 'Dashboard' },
    { to: '/admin/doctors', icon: 'bi-person-badge', label: 'Manage Doctors' },
    { to: '/admin/patients', icon: 'bi-people', label: 'Manage Patients' },
    { to: '/admin/appointments', icon: 'bi-calendar-check', label: 'Appointments' },
    { to: '/admin/profile', icon: 'bi-person-circle', label: 'My Profile' },
  ],
};

const Sidebar = ({ isOpen, onClose }) => {
  const { user } = useAuth();
  const items = menus[user.role] || [];

  return (
    <>
      {isOpen && <div className="sidebar-backdrop" onClick={onClose}></div>}
      <aside className={`sidebar ${isOpen ? 'open' : ''}`}>
        <div className="px-2 pb-3 mb-3 border-bottom">
          <div className="fw-semibold">{user.name}</div>
          <small className="text-muted text-capitalize">{user.role}</small>
        </div>
        <nav className="nav flex-column">
          {items.map((item) => (
            <NavLink key={item.to} to={item.to} className="nav-link" onClick={onClose}>
              <i className={`bi ${item.icon}`}></i> {item.label}
            </NavLink>
          ))}
        </nav>
      </aside>
    </>
  );
};

export default Sidebar;