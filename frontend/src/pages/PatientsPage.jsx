import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  getAllPatients,
  createPatient,
  updatePatient,
  deletePatient,
} from '../api/patients';
import { useAuth } from '../context/AuthContext';

const EMPTY_CREATE = {
  firstName: '', lastName: '', age: '', gender: 'M', email: '',
  phoneNumber: '', address: '', bloodType: '', emergencyContactName: '',
  emergencyContactPhone: '', password: '',
};
const EMPTY_UPDATE = {
  firstName: '', lastName: '', age: '', phoneNumber: '', address: '',
  bloodType: '', emergencyContactName: '', emergencyContactPhone: '',
};

export default function PatientsPage() {
  const { user } = useAuth();
  const role = user?.role;
  const navigate = useNavigate();

  useEffect(() => {
    if (role === 'Patient') {
      navigate('/', { replace: true });
    }
  }, [role, navigate]);
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [modal, setModal] = useState(null);
  const [selected, setSelected] = useState(null);
  const [form, setForm] = useState(EMPTY_CREATE);
  const [search, setSearch] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const fetchPatients = async () => {
    setLoading(true);
    try {
      const res = await getAllPatients();
      setPatients(res.data);
    } catch {
      setError('Failed to load patients.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchPatients(); }, []);

  const openCreate = () => { setForm(EMPTY_CREATE); setModal('create'); setError(''); };
  const openEdit = (p) => {
    setSelected(p);
    setForm({
      firstName: p.firstName, lastName: p.lastName, age: p.age,
      phoneNumber: p.phoneNumber, address: p.address, bloodType: p.bloodType || '',
      emergencyContactName: p.emergencyContactName || '',
      emergencyContactPhone: p.emergencyContactPhone || '',
    });
    setModal('edit');
    setError('');
  };
  const openView = (p) => { setSelected(p); setModal('view'); };
  const closeModal = () => { setModal(null); setSelected(null); setError(''); };

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError('');
    try {
      await createPatient({ ...form, age: Number(form.age) });
      setSuccess('Patient created successfully.');
      closeModal();
      fetchPatients();
    } catch (err) {
      const d = err.response?.data;
      const msg = d?.errors
        ? Object.values(d.errors).flat().join(' ')
        : d?.message || d?.title || 'Failed to create patient.';
      setError(msg);
    } finally {
      setSubmitting(false);
    }
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError('');
    try {
      const payload = { ...form };
      if (payload.age !== '') payload.age = Number(payload.age);
      await updatePatient(selected.patientId, payload);
      setSuccess('Patient updated successfully.');
      closeModal();
      fetchPatients();
    } catch (err) {
      const d = err.response?.data;
      setError(d?.message || d?.title || 'Failed to update patient.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this patient?')) return;
    try {
      await deletePatient(id);
      setSuccess('Patient deleted.');
      fetchPatients();
    } catch {
      setError('Failed to delete patient.');
    }
  };

  const filtered = patients.filter((p) =>
    `${p.firstName} ${p.lastName} ${p.email} ${p.bloodType}`
      .toLowerCase()
      .includes(search.toLowerCase())
  );

  return (
    <div className="page">
      <div className="page-header">
        <h1>Patients</h1>
        {role === 'Admin' && (
          <button className="btn btn-primary" onClick={openCreate}>+ Add Patient</button>
        )}
      </div>

      {success && <div className="alert alert-success" onClick={() => setSuccess('')}>{success}</div>}
      {!modal && error && <div className="alert alert-error">{error}</div>}

      <div className="card">
        <div className="card-toolbar">
          <input
            type="text"
            placeholder="Search patients..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="search-input"
          />
          <span className="text-muted">{filtered.length} record(s)</span>
        </div>

        {loading ? (
          <div className="loading">Loading...</div>
        ) : (
          <div className="table-responsive">
            <table className="table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Name</th>
                  <th>Age</th>
                  <th>Gender</th>
                  <th>Email</th>
                  <th>Blood Type</th>
                  <th>Phone</th>
                  <th>Insurance</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.length === 0 ? (
                  <tr><td colSpan={9} className="text-center text-muted">No patients found.</td></tr>
                ) : filtered.map((p) => (
                  <tr key={p.patientId}>
                    <td>{p.patientId}</td>
                    <td>{p.firstName} {p.lastName}</td>
                    <td>{p.age}</td>
                    <td>{p.gender === 'M' ? 'Male' : 'Female'}</td>
                    <td>{p.email}</td>
                    <td>{p.bloodType || '—'}</td>
                    <td>{p.phoneNumber}</td>
                    <td>
                      {p.insurance
                        ? <span className="badge badge--success">Insured</span>
                        : <span className="badge badge--warning">None</span>}
                    </td>
                    <td>
                      <div className="action-btns">
                        <button className="btn btn-sm btn-outline" onClick={() => openView(p)}>View</button>
                        {role === 'Admin' && (
                          <button className="btn btn-sm btn-secondary" onClick={() => openEdit(p)}>Edit</button>
                        )}
                        {role === 'Admin' && (
                          <button className="btn btn-sm btn-danger" onClick={() => handleDelete(p.patientId)}>Delete</button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Create Modal */}
      {modal === 'create' && (
        <div className="modal-overlay" onClick={closeModal}>
          <div className="modal modal-lg" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Register New Patient</h2>
              <button className="modal-close" onClick={closeModal}>✕</button>
            </div>
            {error && <div className="alert alert-error">{error}</div>}
            <form onSubmit={handleCreate}>
              <div className="form-row">
                <div className="form-group">
                  <label>First Name *</label>
                  <input name="firstName" value={form.firstName} onChange={handleChange} required />
                </div>
                <div className="form-group">
                  <label>Last Name *</label>
                  <input name="lastName" value={form.lastName} onChange={handleChange} required />
                </div>
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>Age *</label>
                  <input type="number" name="age" value={form.age} onChange={handleChange} required min={1} max={150} />
                </div>
                <div className="form-group">
                  <label>Gender *</label>
                  <select name="gender" value={form.gender} onChange={handleChange}>
                    <option value="M">Male</option>
                    <option value="F">Female</option>
                  </select>
                </div>
                <div className="form-group">
                  <label>Blood Type</label>
                  <select name="bloodType" value={form.bloodType} onChange={handleChange}>
                    <option value="">Select</option>
                    {['A+','A-','B+','B-','AB+','AB-','O+','O-'].map(t => <option key={t} value={t}>{t}</option>)}
                  </select>
                </div>
              </div>
              <div className="form-group">
                <label>Email *</label>
                <input type="email" name="email" value={form.email} onChange={handleChange} required />
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>Phone Number *</label>
                  <input name="phoneNumber" value={form.phoneNumber} onChange={handleChange} required pattern="\d{10,15}" placeholder="10-15 digits" />
                </div>
                <div className="form-group">
                  <label>Address *</label>
                  <input name="address" value={form.address} onChange={handleChange} required />
                </div>
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>Emergency Contact Name</label>
                  <input name="emergencyContactName" value={form.emergencyContactName} onChange={handleChange} />
                </div>
                <div className="form-group">
                  <label>Emergency Contact Phone</label>
                  <input name="emergencyContactPhone" value={form.emergencyContactPhone} onChange={handleChange} pattern="\d{10,15}" placeholder="10-15 digits" />
                </div>
              </div>
              <div className="form-group">
                <label>Password *</label>
                <input type="password" name="password" value={form.password} onChange={handleChange} required minLength={8} placeholder="Min. 8 characters" />
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-outline" onClick={closeModal}>Cancel</button>
                <button type="submit" className="btn btn-primary" disabled={submitting}>
                  {submitting ? 'Creating...' : 'Create Patient'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Modal */}
      {modal === 'edit' && selected && (
        <div className="modal-overlay" onClick={closeModal}>
          <div className="modal modal-lg" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Edit Patient</h2>
              <button className="modal-close" onClick={closeModal}>✕</button>
            </div>
            {error && <div className="alert alert-error">{error}</div>}
            <form onSubmit={handleUpdate}>
              <div className="form-row">
                <div className="form-group">
                  <label>First Name</label>
                  <input name="firstName" value={form.firstName} onChange={handleChange} />
                </div>
                <div className="form-group">
                  <label>Last Name</label>
                  <input name="lastName" value={form.lastName} onChange={handleChange} />
                </div>
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>Age</label>
                  <input type="number" name="age" value={form.age} onChange={handleChange} min={1} max={150} />
                </div>
                <div className="form-group">
                  <label>Blood Type</label>
                  <select name="bloodType" value={form.bloodType} onChange={handleChange}>
                    <option value="">Select</option>
                    {['A+','A-','B+','B-','AB+','AB-','O+','O-'].map(t => <option key={t} value={t}>{t}</option>)}
                  </select>
                </div>
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>Phone Number</label>
                  <input name="phoneNumber" value={form.phoneNumber} onChange={handleChange} pattern="\d{10,15}" />
                </div>
                <div className="form-group">
                  <label>Address</label>
                  <input name="address" value={form.address} onChange={handleChange} />
                </div>
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>Emergency Contact Name</label>
                  <input name="emergencyContactName" value={form.emergencyContactName} onChange={handleChange} />
                </div>
                <div className="form-group">
                  <label>Emergency Contact Phone</label>
                  <input name="emergencyContactPhone" value={form.emergencyContactPhone} onChange={handleChange} pattern="\d{10,15}" />
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-outline" onClick={closeModal}>Cancel</button>
                <button type="submit" className="btn btn-primary" disabled={submitting}>
                  {submitting ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* View Modal */}
      {modal === 'view' && selected && (
        <div className="modal-overlay" onClick={closeModal}>
          <div className="modal modal-lg" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Patient Details</h2>
              <button className="modal-close" onClick={closeModal}>✕</button>
            </div>
            <div className="detail-grid">
              <div className="detail-item"><span className="detail-label">ID</span><span>{selected.patientId}</span></div>
              <div className="detail-item"><span className="detail-label">Name</span><span>{selected.firstName} {selected.lastName}</span></div>
              <div className="detail-item"><span className="detail-label">Age</span><span>{selected.age}</span></div>
              <div className="detail-item"><span className="detail-label">Gender</span><span>{selected.gender === 'M' ? 'Male' : 'Female'}</span></div>
              <div className="detail-item"><span className="detail-label">Email</span><span>{selected.email}</span></div>
              <div className="detail-item"><span className="detail-label">Phone</span><span>{selected.phoneNumber}</span></div>
              <div className="detail-item"><span className="detail-label">Blood Type</span><span>{selected.bloodType || '—'}</span></div>
              <div className="detail-item"><span className="detail-label">Address</span><span>{selected.address}</span></div>
              <div className="detail-item"><span className="detail-label">Emergency Contact</span><span>{selected.emergencyContactName || '—'}</span></div>
              <div className="detail-item"><span className="detail-label">Emergency Phone</span><span>{selected.emergencyContactPhone || '—'}</span></div>
            </div>
            {selected.insurance && (
              <>
                <h3 className="section-title">Insurance Information</h3>
                <div className="detail-grid">
                  <div className="detail-item"><span className="detail-label">Provider</span><span>{selected.insurance.providerName}</span></div>
                  <div className="detail-item"><span className="detail-label">Policy #</span><span>{selected.insurance.policyNumber}</span></div>
                  <div className="detail-item"><span className="detail-label">Group #</span><span>{selected.insurance.groupNumber || '—'}</span></div>
                  <div className="detail-item"><span className="detail-label">Coverage</span><span>${selected.insurance.coverageAmount?.toLocaleString()}</span></div>
                  <div className="detail-item"><span className="detail-label">Deductible</span><span>${selected.insurance.deductible?.toLocaleString()}</span></div>
                  <div className="detail-item"><span className="detail-label">Start Date</span><span>{new Date(selected.insurance.policyStartDate).toLocaleDateString()}</span></div>
                  <div className="detail-item"><span className="detail-label">End Date</span><span>{new Date(selected.insurance.policyEndDate).toLocaleDateString()}</span></div>
                  <div className="detail-item"><span className="detail-label">Coverage Details</span><span>{selected.insurance.coverageDetails || '—'}</span></div>
                </div>
              </>
            )}
            <div className="modal-footer">
              <button className="btn btn-outline" onClick={closeModal}>Close</button>
              <button className="btn btn-secondary" onClick={() => { closeModal(); openEdit(selected); }}>Edit</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
