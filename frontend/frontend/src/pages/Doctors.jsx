import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import api, { getErrorMessage } from '../services/api';
import DoctorCard from '../components/DoctorCard';
import Loader from '../components/Loader';
import { SPECIALIZATIONS, SYMPTOM_CATEGORIES } from '../utils/constants';

const Doctors = () => {
  const [searchParams] = useSearchParams();
  const [search, setSearch] = useState('');
  const [specialization, setSpecialization] = useState(searchParams.get('specialization') || 'All');
  const [symptom, setSymptom] = useState('');
  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Re-fetch (after a short delay while typing) whenever search or filter changes
  useEffect(() => {
    const timer = setTimeout(async () => {
      setLoading(true);
      setError('');
      try {
        const { data } = await api.get('/doctors', {
          params: {
            search: search.trim() || undefined,
            specialization: specialization === 'All' ? undefined : specialization,
          },
        });
        setDoctors(data);
      } catch (err) {
        setError(getErrorMessage(err));
      } finally {
        setLoading(false);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [search, specialization]);

  const suggestion = SYMPTOM_CATEGORIES.find((s) => s.label === symptom);

  const applySuggestion = () => {
    setSearch('');
    setSpecialization(suggestion.specialization);
  };

  return (
    <div className="container py-5">
      <h2 className="fw-bold mb-4">Find a Doctor</h2>

      {/* Smart doctor recommendation */}
      <div className="card shadow-sm p-3 mb-4">
        <h6 className="mb-2"><i className="bi bi-lightbulb text-primary me-2"></i>Not sure which doctor to see?</h6>
        <div className="row g-2 align-items-center">
          <div className="col-md-5">
            <select className="form-select" value={symptom} onChange={(e) => setSymptom(e.target.value)}>
              <option value="">Select a symptom category</option>
              {SYMPTOM_CATEGORIES.map((s) => (
                <option key={s.label} value={s.label}>{s.label}</option>
              ))}
            </select>
          </div>
          {suggestion && (
            <div className="col-md-7">
              <span className="me-2">
                Suggested category: <strong>{suggestion.specialization}</strong>
              </span>
              <button className="btn btn-primary btn-sm" onClick={applySuggestion}>
                Show {suggestion.specialization}s
              </button>
            </div>
          )}
        </div>
        <small className="text-muted mt-2">
          This is only a doctor-category suggestion and not a medical diagnosis. In an emergency,
          contact your nearest hospital immediately.
        </small>
      </div>

      {/* Search + filters */}
      <div className="input-group mb-3">
        <span className="input-group-text bg-white"><i className="bi bi-search"></i></span>
        <input
          className="form-control"
          placeholder="Search by doctor name or specialization"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      <div className="d-flex flex-wrap gap-2 mb-4">
        {['All', ...SPECIALIZATIONS].map((item) => (
          <button
            key={item}
            className={`btn btn-sm ${specialization === item ? 'btn-primary' : 'btn-outline-primary'}`}
            onClick={() => setSpecialization(item)}
          >
            {item}
          </button>
        ))}
      </div>

      {error && <div className="alert alert-danger">{error}</div>}

      {loading ? (
        <Loader text="Finding doctors..." />
      ) : doctors.length === 0 ? (
        <div className="text-center text-muted py-5">
          <i className="bi bi-search fs-1"></i>
          <p className="mt-2">No doctors found. Try a different search or category.</p>
        </div>
      ) : (
        <div className="row g-4">
          {doctors.map((doctor) => (
            <div className="col-sm-6 col-lg-4 col-xl-3" key={doctor._id}>
              <DoctorCard doctor={doctor} />
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Doctors;