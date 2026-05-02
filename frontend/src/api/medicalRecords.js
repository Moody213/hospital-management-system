import api from './axios';

export const getMedicalRecordById = (id) => api.get(`/medicalrecords/${id}`);
export const getPatientMedicalRecords = (patientId) => api.get(`/medicalrecords/patient/${patientId}`);
export const createMedicalRecord = (data) => api.post('/medicalrecords', data);
export const updateMedicalRecord = (id, data) => api.put(`/medicalrecords/${id}`, data);
export const deleteMedicalRecord = (id) => api.delete(`/medicalrecords/${id}`);
