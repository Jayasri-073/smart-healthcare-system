const Loader = ({ text = 'Loading...' }) => (
  <div className="text-center py-5">
    <div className="spinner-border text-primary" role="status"></div>
    <p className="text-muted mt-2 mb-0">{text}</p>
  </div>
);

export default Loader;