import { useState, useEffect } from 'react';
import {
  getAllAppointments,
  getDoctorAppointments,
  getPatientAppointments,
  createAppointment,
  updateAppointment,
  deleteAppointment,
} from '../api/appointments';
import { getAllDoctors } from '../api/doctors';
import { getAllPatients } from '../api/patients';
import { useAuth } from '../context/AuthContext';

const STATUS_OPTIONS = ['Scheduled', 'Completed', 'Cancelled', 'No-Show'];

export default function AppointmentsPage() {
  const { user } = useAuth();
  const role = user?.role;
  const entityId = user?.entityId;

  const [appointments, setAppointments] = useState([]);
  const [doctors, setDoctors] = useState([]);
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [modal, setModal] = useState(null);
  const [selected, setSelected] = useState(null);
  const [form, setForm] = useState({});
  const [search, setSearch] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const fetchAll = async () => {
    setLoading(true);
    setError('');
    try {
      let apptData = [];
      if (role === 'Admin') {
        const res = await getAllAppointments();
        apptData = res.data;
      } else if (role === 'Doctor' && entityId) {
        const res = await getDoctorAppointments(entityId);
        apptData = res.data;
      } else if (role === 'Patient' && entityId) {
        const res = await getPatientAppointments(entityId);
        apptData = res.data;
      }
      setAppointments(apptData);

      const docRes = await getAllDoctors();
      setDoctors(docRes.data);

      if (role === 'Admin' || role === 'Doctor') {
        const patRes = await getAllPatients();
        setPatients(patRes.data);
      }
    } catch (err) {
      const d = err.response?.data;
      setError(d?.message || d?.title || 'Failed to load appointments.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchAll(); }, [role, entityId]);

  const openCreate = () => {
    if (role === 'Patient' && !entityId) {
      setError('Your patient profile is not fully set up yet. Please contact an administrator or log out and log back in.');
      return;
    }
    const base = { doctorId: '', patientId: '', appointmentDate: '', timeSlot: '', reason: '', notes: '' };
    if (role === 'Doctor') base.doctorId = entityId;
    if (role === 'Patient') base.patientId = entityId;
    setForm(base);
    setModal('create');
    setError('');
  };
  const openEdit = (a) => {
    setSelected(a);
    setForm({
      doctorId: a.doctorId, patientId: a.patientId,
      appointmentDate: a.appointmentDate?.slice(0, 16) || '',
      timeSlot: a.timeSlot, reason: a.reason || '', notes: a.notes || '',
      status: a.status,
    });
    setModal('edit');
    setError('');
  };
  const openView = (a) => { setSelected(a); setModal('view'); };
  const closeModal = () => { setModal(null); setSelected(null); setError(''); };

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleCreate = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError('');
    try {
      await createAppointment({
        ...form,
        doctorId: Number(form.doctorId),
        patientId: Number(form.patientId),
      });
      setSuccess('Appointment created successfully.');
      closeModal();
      fetchAll();
    } catch (err) {
      const d = err.response?.data;
      const msg = d?.errors
        ? Object.values(d.errors).flat().join(' ')
        : d?.message || d?.title || 'Failed to create appointment.';
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
      const updatePayload = {
        status: form.status,
        notes: form.notes,
      };
      if (role !== 'Doctor') {
        updatePayload.appointmentDate = form.appointmentDate || undefined;
        updatePayload.timeSlot = form.timeSlot || undefined;
        updatePayload.reason = form.reason || undefined;
      }
      await updateAppointment(selected.appointmentId, updatePayload);
      setSuccess('Appointment updated successfully.');
      closeModal();
      fetchAll();
    } catch (err) {
      const d = err.response?.data;
      setError(d?.message || d?.title || 'Failed to update appointment.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this appointment?')) return;
    try {
      await deleteAppointment(id);
      setSuccess('Appointment deleted.');
      fetchAll();
    } catch {
      setError('Failed to delete appointment.');
    }
  };

  const getDoctorName = (id) => {
    const d = doctors.find(x => x.doctorId === id);
    return d ? `Dr. ${d.firstName} ${d.lastName}` : `Doctor #${id}`;
  };
  const getPatientName = (id) => {
    const p = patients.find(x => x.patientId === id);
    return p ? `${p.firstName} ${p.lastName}` : `Patient #${id}`;
  };

  const filtered = appointments.filter((a) => {
    const doctorLabel = getDoctorName(a.doctorId);
    const patientLabel = role !== 'Patient' ? getPatientName(a.patientId) : '';
    return `${doctorLabel} ${patientLabel} ${a.status} ${a.reason || ''}`
      .toLowerCase()
      .includes(search.toLowerCase());
  });

  const canCreate = role === 'Admin' || role === 'Patient';
  const canDelete = role === 'Admin';

  return (
    <div className="page">
      <div className="page-header">
        <h1>Appointments</h1>
        {canCreate && (
          <button className="btn btn-primary" onClick={openCreate}>+ Schedule Appointment</button>
        )}
      </div>

      {success && <div className="alert alert-success" onClick={() => setSuccess('')}>{success}</div>}
      {!modal && error && <div className="alert alert-error">{error}</div>}

      <div className="card">
        <div className="card-toolbar">
          <input
            type="text"
            placeholder="Search appointments..."
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
                  <th>Doctor</th>
                  {role !== 'Patient' && <th>Patient</th>}
                  <th>Date</th>
                  <th>Time Slot</th>
                  <th>Reason</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.length === 0 ? (
                  <tr><td colSpan={role !== 'Patient' ? 8 : 7} className="text-center text-muted">No appointments found.</td></tr>
                ) : filtered.map((a) => (
                  <tr key={a.appointmentId}>
                    <td>{a.appointmentId}</td>
                    <td>{getDoctorName(a.doctorId)}</td>
                    {role !== 'Patient' && <td>{getPatientName(a.patientId)}</td>}
                    <td>{new Date(a.appointmentDate).toLocaleDateString()}</td>
                    <td>{a.timeSlot}</td>
                    <td className="truncate">{a.reason || '—'}</td>
                    <td>
                      <span className={`badge badge--${(a.status || '').toLowerCase()}`}>
                        {a.status}
                      </span>
                    </td>
                    <td>
                      <div className="action-btns">
                        <button className="btn btn-sm btn-outline" onClick={() => openView(a)}>View</button>
                        <button className="btn btn-sm btn-secondary" onClick={() => openEdit(a)}>
                          {role === 'Doctor' ? 'Update Status' : 'Edit'}
                        </button>
                        {canDelete && (
                          <button className="btn btn-sm btn-danger" onClick={() => handleDelete(a.appointmentId)}>Delete</button>
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
              <h2>Schedule Appointment</h2>
              <button className="modal-close" onClick={closeModal}>✕</button>
            </div>
            {error && <div className="alert alert-error">{error}</div>}
            <form onSubmit={handleCreate}>
              <div className="form-row">
                <div className="form-group">
                  <label>Doctor *</label>
                  <select name="doctorId" value={form.doctorId} onChange={handleChange} required>
                    <option value="">Select Doctor</option>
                    {doctors.map(d => (
                      <option key={d.doctorId} value={d.doctorId}>
                        Dr. {d.firstName} {d.lastName} ({d.specialization})
                      </option>
                    ))}
                  </select>
                </div>
                {role === 'Admin' && (
                  <div className="form-group">
                    <label>Patient *</label>
                    <select name="patientId" value={form.patientId} onChange={handleChange} required>
                      <option value="">Select Patient</option>
                      {patients.map(p => (
                        <option key={p.patientId} value={p.patientId}>
                          {p.firstName} {p.lastName}
                        </option>
                      ))}
                    </select>
                  </div>
                )}
                {role === 'Patient' && (
                  <div className="form-group">
                    <label>Patient</label>
                    <input
                      value={user?.entityData ? `${user.entityData.firstName} ${user.entityData.lastName}` : entityId ? `Patient #${entityId}` : 'Profile not linked'}
                      disabled
                    />
                  </div>
                )}
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>Appointment Date *</label>
                  <input type="datetime-local" name="appointmentDate" value={form.appointmentDate} onChange={handleChange} required />
                </div>
                <div className="form-group">
                  <label>Time Slot *</label>
                  <input name="timeSlot" value={form.timeSlot} onChange={handleChange} required placeholder="e.g. 10:00 AM" />
                </div>
              </div>
              <div className="form-group">
                <label>Reason</label>
                <input name="reason" value={form.reason} onChange={handleChange} placeholder="Reason for visit" />
              </div>
              <div className="form-group">
                <label>Notes</label>
                <textarea name="notes" value={form.notes} onChange={handleChange} rows={3} placeholder="Additional notes..." />
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-outline" onClick={closeModal}>Cancel</button>
                <button type="submit" className="btn btn-primary" disabled={submitting}>
                  {submitting ? 'Scheduling...' : 'Schedule'}
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
              <h2>{role === 'Doctor' ? 'Update Appointment Status' : 'Edit Appointment'}</h2>
              <button className="modal-close" onClick={closeModal}>✕</button>
            </div>
            {error && <div className="alert alert-error">{error}</div>}
            <form onSubmit={handleUpdate}>
              {role !== 'Doctor' && (
                <div className="form-row">
                  <div className="form-group">
                    <label>Appointment Date</label>
                    <input type="datetime-local" name="appointmentDate" value={form.appointmentDate} onChange={handleChange} />
                  </div>
                  <div className="form-group">
                    <label>Time Slot</label>
                    <input name="timeSlot" value={form.timeSlot} onChange={handleChange} />
                  </div>
                </div>
              )}
              <div className="form-row">
                <div className="form-group">
                  <label>Status</label>
                  <select name="status" value={form.status} onChange={handleChange}>
                    {STATUS_OPTIONS.map(s => <option key={s} value={s}>{s}</option>)}
                  </select>
                </div>
                {role !== 'Doctor' && (
                  <div className="form-group">
                    <label>Reason</label>
                    <input name="reason" value={form.reason} onChange={handleChange} />
                  </div>
                )}
              </div>
              <div className="form-group">
                <label>Notes</label>
                <textarea name="notes" value={form.notes} onChange={handleChange} rows={3} />
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
              <h2>Appointment Details</h2>
              <button className="modal-close" onClick={closeModal}>✕</button>
            </div>
            <div className="detail-grid">
              <div className="detail-item"><span className="detail-label">ID</span><span>{selected.appointmentId}</span></div>
              <div className="detail-item"><span className="detail-label">Doctor</span><span>{getDoctorName(selected.doctorId)}</span></div>
              {role !== 'Patient' && (
                <div className="detail-item"><span className="detail-label">Patient</span><span>{getPatientName(selected.patientId)}</span></div>
              )}
              <div className="detail-item"><span className="detail-label">Date</span><span>{new Date(selected.appointmentDate).toLocaleString()}</span></div>
              <div className="detail-item"><span className="detail-label">Time Slot</span><span>{selected.timeSlot}</span></div>
              <div className="detail-item"><span className="detail-label">Status</span>
                <span className={`badge badge--${(selected.status || '').toLowerCase()}`}>{selected.status}</span>
              </div>
              <div className="detail-item"><span className="detail-label">Reason</span><span>{selected.reason || '—'}</span></div>
              <div className="detail-item"><span className="detail-label">Notes</span><span>{selected.notes || '—'}</span></div>
              <div className="detail-item"><span className="detail-label">Created At</span><span>{new Date(selected.createdAt).toLocaleString()}</span></div>
              {selected.updatedAt && (
                <div className="detail-item"><span className="detail-label">Updated At</span><span>{new Date(selected.updatedAt).toLocaleString()}</span></div>
              )}
            </div>
            <div className="modal-footer">
              <button className="btn btn-outline" onClick={closeModal}>Close</button>
              <button className="btn btn-secondary" onClick={() => { closeModal(); openEdit(selected); }}>
                {role === 'Doctor' ? 'Update Status' : 'Edit'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
