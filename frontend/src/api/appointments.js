import api from './axios';

export const getAllAppointments = () => api.get('/appointments');
export const getAppointmentById = (id) => api.get(`/appointments/${id}`);
export const getDoctorAppointments = (doctorId) => api.get(`/appointments/doctor/${doctorId}`);
export const getPatientAppointments = (patientId) => api.get(`/appointments/patient/${patientId}`);
export const createAppointment = (data) => api.post('/appointments', data);
export const updateAppointment = (id, data) => api.put(`/appointments/${id}`, data);
export const deleteAppointment = (id) => api.delete(`/appointments/${id}`);
