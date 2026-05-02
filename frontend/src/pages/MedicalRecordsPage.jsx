import { useState, useEffect } from 'react';
import {
  getPatientMedicalRecords,
  createMedicalRecord,
  updateMedicalRecord,
  deleteMedicalRecord,
} from '../api/medicalRecords';
import { getAllPatients } from '../api/patients';
import { useAuth } from '../context/AuthContext';

const EMPTY_CREATE = {
  patientId: '', diagnosis: '', recordDate: '', symptoms: '',
  treatment: '', prescriptions: '', notes: '',
};

export default function MedicalRecordsPage() {
  const { user } = useAuth();
  const role = user?.role;
  const entityId = user?.entityId;

  const [records, setRecords] = useState([]);
  const [patients, setPatients] = useState([]);
  const [selectedPatientId, setSelectedPatientId] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [modal, setModal] = useState(null);
  const [selected, setSelected] = useState(null);
  const [form, setForm] = useState({});
  const [search, setSearch] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const fetchRecords = async (patientId) => {
    if (!patientId) { setRecords([]); return; }
    setLoading(true);
    setError('');
    try {
      const res = await getPatientMedicalRecords(patientId);
      setRecords(res.data);
    } catch {
      setError('Failed to load medical records.');
      setRecords([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (role === 'Admin' || role === 'Doctor') {
      getAllPatients()
        .then(res => setPatients(res.data))
        .catch(() => setError('Failed to load patients list.'));
    } else if (role === 'Patient' && entityId) {
      setSelectedPatientId(entityId);
      fetchRecords(entityId);
    }
  }, [role, entityId]);

  const handlePatientChange = (e) => {
    const id = e.target.value;
    setSelectedPatientId(id);
    fetchRecords(id);
  };

  const openCreate = () => {
    setForm({ ...EMPTY_CREATE, patientId: selectedPatientId });
    setModal('create');
    setError('');
  };
  const openEdit = (r) => {
    setSelected(r);
    setForm({
      diagnosis: r.diagnosis, symptoms: r.symptoms || '',
      treatment: r.treatment || '', prescriptions: r.prescriptions || '',
      notes: r.notes || '',
    });
    setModal('edit');
    setError('');
  };
  const openView = (r) => { setSelected(r); setModal('view'); };
  const closeModal = () => { setModal(null); setSelected(null); setError(''); };

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError('');
    try {
      await createMedicalRecord({
        ...form,
        patientId: Number(form.patientId),
      });
      setSuccess('Medical record created successfully.');
      closeModal();
      fetchRecords(selectedPatientId);
    } catch (err) {
      const d = err.response?.data;
      const msg = d?.errors
        ? Object.values(d.errors).flat().join(' ')
        : d?.message || d?.title || 'Failed to create medical record.';
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
      await updateMedicalRecord(selected.medicalRecordId, form);
      setSuccess('Medical record updated successfully.');
      closeModal();
      fetchRecords(selectedPatientId);
    } catch (err) {
      const d = err.response?.data;
      setError(d?.message || d?.title || 'Failed to update medical record.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this medical record?')) return;
    try {
      await deleteMedicalRecord(id);
      setSuccess('Medical record deleted.');
      fetchRecords(selectedPatientId);
    } catch {
      setError('Failed to delete medical record.');
    }
  };

  const getPatientName = (id) => {
    const p = patients.find(x => x.patientId === id);
    return p ? `${p.firstName} ${p.lastName}` : `Patient #${id}`;
  };

  const filtered = records.filter((r) =>
    `${r.diagnosis} ${r.symptoms || ''} ${r.treatment || ''}`
      .toLowerCase()
      .includes(search.toLowerCase())
  );

  return (
    <div className="page">
      <div className="page-header">
        <h1>Medical Records</h1>
        {(role === 'Admin' || role === 'Doctor') && (
          <button className="btn btn-primary" onClick={openCreate} disabled={!selectedPatientId}>
            + Add Record
          </button>
        )}
      </div>

      {success && <div className="alert alert-success" onClick={() => setSuccess('')}>{success}</div>}
      {!modal && error && <div className="alert alert-error">{error}</div>}

      <div className="card">
        <div className="card-toolbar card-toolbar--wrap">
          {(role === 'Admin' || role === 'Doctor') && (
            <div className="form-group form-group--inline">
              <label>Filter by Patient:</label>
              <select value={selectedPatientId} onChange={handlePatientChange} style={{ minWidth: 220 }}>
                <option value="">— Select a patient —</option>
                {patients.map(p => (
                  <option key={p.patientId} value={p.patientId}>
                    {p.firstName} {p.lastName}
                  </option>
                ))}
              </select>
            </div>
          )}
          {selectedPatientId && (
            <input
              type="text"
              placeholder="Search records..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="search-input"
            />
          )}
          {selectedPatientId && <span className="text-muted">{filtered.length} record(s)</span>}
        </div>

        {(role === 'Admin' || role === 'Doctor') && !selectedPatientId ? (
          <p className="text-center text-muted py-4">Select a patient to view their medical records.</p>
        ) : loading ? (
          <div className="loading">Loading...</div>
        ) : (
          <div className="table-responsive">
            <table className="table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Patient</th>
                  <th>Diagnosis</th>
                  <th>Record Date</th>
                  <th>Treatment</th>
                  <th>Scans</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.length === 0 ? (
                  <tr><td colSpan={7} className="text-center text-muted">No medical records found.</td></tr>
                ) : filtered.map((r) => (
                  <tr key={r.medicalRecordId}>
                    <td>{r.medicalRecordId}</td>
                    <td>{getPatientName(r.patientId)}</td>
                    <td>{r.diagnosis}</td>
                    <td>{new Date(r.recordDate).toLocaleDateString()}</td>
                    <td className="truncate">{r.treatment || '—'}</td>
                    <td>{r.scans?.length || 0}</td>
                    <td>
                      <div className="action-btns">
                        <button className="btn btn-sm btn-outline" onClick={() => openView(r)}>View</button>
                        {(role === 'Admin' || role === 'Doctor') && (
                          <button className="btn btn-sm btn-secondary" onClick={() => openEdit(r)}>Edit</button>
                        )}
                        {role === 'Admin' && (
                          <button className="btn btn-sm btn-danger" onClick={() => handleDelete(r.medicalRecordId)}>Delete</button>
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
              <h2>Add Medical Record</h2>
              <button className="modal-close" onClick={closeModal}>✕</button>
            </div>
            {error && <div className="alert alert-error">{error}</div>}
            <form onSubmit={handleCreate}>
              <div className="form-row">
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
                <div className="form-group">
                  <label>Record Date *</label>
                  <input type="datetime-local" name="recordDate" value={form.recordDate} onChange={handleChange} required />
                </div>
              </div>
              <div className="form-group">
                <label>Diagnosis *</label>
                <input name="diagnosis" value={form.diagnosis} onChange={handleChange} required />
              </div>
              <div className="form-group">
                <label>Symptoms</label>
                <textarea name="symptoms" value={form.symptoms} onChange={handleChange} rows={2} />
              </div>
              <div className="form-group">
                <label>Treatment</label>
                <textarea name="treatment" value={form.treatment} onChange={handleChange} rows={2} />
              </div>
              <div className="form-group">
                <label>Prescriptions</label>
                <textarea name="prescriptions" value={form.prescriptions} onChange={handleChange} rows={2} />
              </div>
              <div className="form-group">
                <label>Notes</label>
                <textarea name="notes" value={form.notes} onChange={handleChange} rows={2} />
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-outline" onClick={closeModal}>Cancel</button>
                <button type="submit" className="btn btn-primary" disabled={submitting}>
                  {submitting ? 'Creating...' : 'Create Record'}
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
              <h2>Edit Medical Record</h2>
              <button className="modal-close" onClick={closeModal}>✕</button>
            </div>
            {error && <div className="alert alert-error">{error}</div>}
            <form onSubmit={handleUpdate}>
              <div className="form-group">
                <label>Diagnosis</label>
                <input name="diagnosis" value={form.diagnosis} onChange={handleChange} />
              </div>
              <div className="form-group">
                <label>Symptoms</label>
                <textarea name="symptoms" value={form.symptoms} onChange={handleChange} rows={2} />
              </div>
              <div className="form-group">
                <label>Treatment</label>
                <textarea name="treatment" value={form.treatment} onChange={handleChange} rows={2} />
              </div>
              <div className="form-group">
                <label>Prescriptions</label>
                <textarea name="prescriptions" value={form.prescriptions} onChange={handleChange} rows={2} />
              </div>
              <div className="form-group">
                <label>Notes</label>
                <textarea name="notes" value={form.notes} onChange={handleChange} rows={2} />
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
              <h2>Medical Record Details</h2>
              <button className="modal-close" onClick={closeModal}>✕</button>
            </div>
            <div className="detail-grid">
              <div className="detail-item"><span className="detail-label">ID</span><span>{selected.medicalRecordId}</span></div>
              <div className="detail-item"><span className="detail-label">Patient</span><span>{getPatientName(selected.patientId)}</span></div>
              <div className="detail-item"><span className="detail-label">Diagnosis</span><span>{selected.diagnosis}</span></div>
              <div className="detail-item"><span className="detail-label">Record Date</span><span>{new Date(selected.recordDate).toLocaleString()}</span></div>
              <div className="detail-item"><span className="detail-label">Symptoms</span><span>{selected.symptoms || '—'}</span></div>
              <div className="detail-item"><span className="detail-label">Treatment</span><span>{selected.treatment || '—'}</span></div>
              <div className="detail-item"><span className="detail-label">Prescriptions</span><span>{selected.prescriptions || '—'}</span></div>
              <div className="detail-item"><span className="detail-label">Notes</span><span>{selected.notes || '—'}</span></div>
            </div>

            {selected.scans && selected.scans.length > 0 && (
              <>
                <h3 className="section-title">Scans ({selected.scans.length})</h3>
                <div className="table-responsive">
                  <table className="table">
                    <thead>
                      <tr>
                        <th>ID</th>
                        <th>Type</th>
                        <th>Date</th>
                        <th>Diagnosis</th>
                        <th>File Path</th>
                        <th>Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {selected.scans.map(scan => (
                        <tr key={scan.scanId}>
                          <td>{scan.scanId}</td>
                          <td>{scan.scanType}</td>
                          <td>{new Date(scan.scanDate).toLocaleDateString()}</td>
                          <td>{scan.diagnosis || '—'}</td>
                          <td className="truncate">{scan.filePath || '—'}</td>
                          <td>
                            <span className={`badge badge--${(scan.status || '').toLowerCase()}`}>
                              {scan.status || '—'}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
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
