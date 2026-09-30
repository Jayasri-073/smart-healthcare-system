import { Link } from 'react-router-dom';

const NotFound = () => (
  <div className="container py-5 text-center">
    <h1 className="display-1 fw-bold text-primary">404</h1>
    <p className="lead">The page you are looking for does not exist.</p>
    <Link to="/" className="btn btn-primary">Go Home</Link>
  </div>
);

export default NotFound;