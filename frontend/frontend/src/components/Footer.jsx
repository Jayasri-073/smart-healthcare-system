import { Link } from 'react-router-dom';

const Footer = () => (
  <footer className="footer pt-5 pb-3">
    <div className="container">
      <div className="row g-4">
        <div className="col-md-5">
          <h5 className="text-white">
            <i className="bi bi-heart-pulse-fill me-2"></i>SmartCare
          </h5>
          <p className="small">
            Book appointments with trusted doctors easily and manage your healthcare in one place.
          </p>
        </div>
        <div className="col-6 col-md-3">
          <h6 className="text-white">Quick Links</h6>
          <ul className="list-unstyled small">
            <li><Link to="/">Home</Link></li>
            <li><Link to="/doctors">Find Doctors</Link></li>
            <li><Link to="/about">About</Link></li>
            <li><Link to="/contact">Contact</Link></li>
          </ul>
        </div>
        <div className="col-6 col-md-4">
          <h6 className="text-white">Contact</h6>
          <ul className="list-unstyled small">
            <li><i className="bi bi-envelope me-2"></i>support@smartcare.com</li>
            <li><i className="bi bi-telephone me-2"></i>+91 98765 43210</li>
            <li><i className="bi bi-geo-alt me-2"></i>Tamil Nadu, India</li>
          </ul>
        </div>
      </div>
      <hr className="border-secondary" />
      <p className="text-center small mb-0">
        &copy; {new Date().getFullYear()} SmartCare. Built as a MERN stack project.
      </p>
    </div>
  </footer>
);

export default Footer;