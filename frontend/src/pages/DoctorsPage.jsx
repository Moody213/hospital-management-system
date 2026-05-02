import { useState, useEffect } from 'react';
import {
  getAllDoctors,
  createDoctor,
  updateDoctor,
  deleteDoctor,
} from '../api/doctors';
import { useAuth } from '../context/AuthContext';

const EMPTY_CREATE = {
  firstName: '', lastName: '', licenseNumber: '', specialization: '',
  email: '', phoneNumber: '', yearsOfExperience: 0, password: '',
};
const EMPTY_UPDATE = {
  firstName: '', lastName: '', specialization: '', phoneNumber: '',
  yearsOfExperience: '', isActive: true,
};

export default function DoctorsPage() {
  const { user } = useAuth();
  const role = user?.role;
  const myDoctorId = role === 'Doctor' ? user?.entityId : null;
  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [modal, setModal] = useState(null); // 'create' | 'edit' | 'view' | null
  const [selected, setSelected] = useState(null);
  const [form, setForm] = useState(EMPTY_CREATE);
  const [search, setSearch] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const fetchDoctors = async () => {
    setLoading(true);
    try {
      const res = await getAllDoctors();
      setDoctors(res.data);
    } catch {
      setError('Failed to load doctors.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchDoctors(); }, []);

  const openCreate = () => { setForm(EMPTY_CREATE); setModal('create'); setError(''); };
  const openEdit = (doctor) => {
    setSelected(doctor);
    setForm({
      firstName: doctor.firstName,
      lastName: doctor.lastName,
      specialization: doctor.specialization,
      phoneNumber: doctor.phoneNumber,
      yearsOfExperience: doctor.yearsOfExperience,
      isActive: doctor.isActive,
    });
    setModal('edit');
    setError('');
  };
  const openView = (doctor) => { setSelected(doctor); setModal('view'); };
  const closeModal = () => { setModal(null); setSelected(null); setError(''); };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm({ ...form, [name]: type === 'checkbox' ? checked : value });
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError('');
    try {
      await createDoctor({ ...form, yearsOfExperience: Number(form.yearsOfExperience) });
      setSuccess('Doctor created successfully.');
      closeModal();
      fetchDoctors();
    } catch (err) {
      const d = err.response?.data;
      const msg = d?.errors
        ? Object.values(d.errors).flat().join(' ')
        : d?.message || d?.title || 'Failed to create doctor.';
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
      if (payload.yearsOfExperience !== '') payload.yearsOfExperience = Number(payload.yearsOfExperience);
      await updateDoctor(selected.doctorId, payload);
      setSuccess('Doctor updated successfully.');
      closeModal();
      fetchDoctors();
    } catch (err) {
      const d = err.response?.data;
      setError(d?.message || d?.title || 'Failed to update doctor.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this doctor?')) return;
    try {
      await deleteDoctor(id);
      setSuccess('Doctor deleted.');
      fetchDoctors();
    } catch {
      setError('Failed to delete doctor.');
    }
  };

  const filtered = doctors.filter((d) =>
    `${d.firstName} ${d.lastName} ${d.specialization} ${d.email}`
      .toLowerCase()
      .includes(search.toLowerCase())
  );

  return (
    <div className="page">
      <div className="page-header">
        <h1>Doctors</h1>
        {role === 'Admin' && (
          <button className="btn btn-primary" onClick={openCreate}>+ Add Doctor</button>
        )}
      </div>

      {success && <div className="alert alert-success" onClick={() => setSuccess('')}>{success}</div>}
      {!modal && error && <div className="alert alert-error">{error}</div>}

      <div className="card">
        <div className="card-toolbar">
          <input
            type="text"
            placeholder="Search doctors..."
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
                  <th>Specialization</th>
                  <th>Email</th>
                  <th>Phone</th>
                  <th>Experience</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.length === 0 ? (
                  <tr><td colSpan={8} className="text-center text-muted">No doctors found.</td></tr>
                ) : filtered.map((doctor) => (
                  <tr key={doctor.doctorId}>
                    <td>{doctor.doctorId}</td>
                    <td>{doctor.firstName} {doctor.lastName}</td>
                    <td>{doctor.specialization}</td>
                    <td>{doctor.email}</td>
                    <td>{doctor.phoneNumber}</td>
                    <td>{doctor.yearsOfExperience} yrs</td>
                    <td>
                      <span className={`badge ${doctor.isActive ? 'badge--success' : 'badge--danger'}`}>
                        {doctor.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td>
                      <div className="action-btns">
                        <button className="btn btn-sm btn-outline" onClick={() => openView(doctor)}>View</button>
                        {(role === 'Admin' || (role === 'Doctor' && doctor.doctorId === myDoctorId)) && (
                          <button className="btn btn-sm btn-secondary" onClick={() => openEdit(doctor)}>Edit</button>
                        )}
                        {role === 'Admin' && (
                          <button className="btn btn-sm btn-danger" onClick={() => handleDelete(doctor.doctorId)}>Delete</button>
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
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Add New Doctor</h2>
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
                  <label>License Number *</label>
                  <input name="licenseNumber" value={form.licenseNumber} onChange={handleChange} required />
                </div>
                <div className="form-group">
                  <label>Specialization *</label>
                  <input name="specialization" value={form.specialization} onChange={handleChange} required />
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
                  <label>Years of Experience</label>
                  <input type="number" name="yearsOfExperience" value={form.yearsOfExperience} onChange={handleChange} min={0} max={100} />
                </div>
              </div>
              <div className="form-group">
                <label>Password *</label>
                <input type="password" name="password" value={form.password} onChange={handleChange} required minLength={8} placeholder="Min. 8 characters" />
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-outline" onClick={closeModal}>Cancel</button>
                <button type="submit" className="btn btn-primary" disabled={submitting}>
                  {submitting ? 'Creating...' : 'Create Doctor'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Modal */}
      {modal === 'edit' && selected && (
        <div className="modal-overlay" onClick={closeModal}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Edit Doctor</h2>
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
                  <label>Specialization</label>
                  <input name="specialization" value={form.specialization} onChange={handleChange} />
                </div>
                <div className="form-group">
                  <label>Phone Number</label>
                  <input name="phoneNumber" value={form.phoneNumber} onChange={handleChange} pattern="\d{10,15}" />
                </div>
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>Years of Experience</label>
                  <input type="number" name="yearsOfExperience" value={form.yearsOfExperience} onChange={handleChange} min={0} max={100} />
                </div>
                <div className="form-group form-check-group">
                  <label>
                    <input type="checkbox" name="isActive" checked={form.isActive} onChange={handleChange} />
                    {' '}Active
                  </label>
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
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Doctor Details</h2>
              <button className="modal-close" onClick={closeModal}>✕</button>
            </div>
            <div className="detail-grid">
              <div className="detail-item"><span className="detail-label">ID</span><span>{selected.doctorId}</span></div>
              <div className="detail-item"><span className="detail-label">Name</span><span>{selected.firstName} {selected.lastName}</span></div>
              <div className="detail-item"><span className="detail-label">Specialization</span><span>{selected.specialization}</span></div>
              <div className="detail-item"><span className="detail-label">Email</span><span>{selected.email}</span></div>
              <div className="detail-item"><span className="detail-label">Phone</span><span>{selected.phoneNumber}</span></div>
              <div className="detail-item"><span className="detail-label">Experience</span><span>{selected.yearsOfExperience} years</span></div>
              <div className="detail-item"><span className="detail-label">Status</span>
                <span className={`badge ${selected.isActive ? 'badge--success' : 'badge--danger'}`}>
                  {selected.isActive ? 'Active' : 'Inactive'}
                </span>
              </div>
            </div>
            {selected.doctorProfile && (
              <>
                <h3 className="section-title">Doctor Profile</h3>
                <div className="detail-grid">
                  <div className="detail-item"><span className="detail-label">Bio</span><span>{selected.doctorProfile.bio}</span></div>
                  <div className="detail-item"><span className="detail-label">Qualifications</span><span>{selected.doctorProfile.qualifications}</span></div>
                  <div className="detail-item"><span className="detail-label">Office Address</span><span>{selected.doctorProfile.officeAddress}</span></div>
                  <div className="detail-item"><span className="detail-label">Clinical Interests</span><span>{selected.doctorProfile.clinicalInterests}</span></div>
                  <div className="detail-item"><span className="detail-label">TeleHealth</span>
                    <span className={`badge ${selected.doctorProfile.isAvailableForTeleHealth ? 'badge--success' : 'badge--danger'}`}>
                      {selected.doctorProfile.isAvailableForTeleHealth ? 'Available' : 'Not Available'}
                    </span>
                  </div>
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
