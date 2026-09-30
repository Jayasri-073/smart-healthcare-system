const colors = {
  pending: 'bg-warning text-dark',
  confirmed: 'bg-primary',
  rejected: 'bg-danger',
  completed: 'bg-success',
  cancelled: 'bg-secondary',
};

const StatusBadge = ({ status }) => (
  <span className={`badge text-capitalize ${colors[status] || 'bg-secondary'}`}>{status}</span>
);

export default StatusBadge;