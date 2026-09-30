const StatCard = ({ icon, label, value, color = 'primary' }) => (
  <div className="card shadow-sm h-100">
    <div className="card-body d-flex align-items-center gap-3">
      <div className={`stat-icon bg-${color} bg-opacity-10 text-${color}`}>
        <i className={`bi ${icon}`}></i>
      </div>
      <div>
        <div className="text-muted small">{label}</div>
        <div className="fs-3 fw-bold lh-1">{value}</div>
      </div>
    </div>
  </div>
);

export default StatCard;