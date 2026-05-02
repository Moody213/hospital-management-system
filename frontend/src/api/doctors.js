import api from './axios';

export const getAllDoctors = () => api.get('/doctors');
export const getDoctorById = (id) => api.get(`/doctors/${id}`);
export const getMyDoctorProfile = () => api.get('/doctors/me');
export const getDoctorsBySpecialization = (spec) => api.get(`/doctors/specialization/${spec}`);
export const createDoctor = (data) => api.post('/doctors', data);
export const updateDoctor = (id, data) => api.put(`/doctors/${id}`, data);
export const deleteDoctor = (id) => api.delete(`/doctors/${id}`);

export const getDoctorProfile = (doctorId) => api.get(`/doctors/${doctorId}/profile`);
export const createDoctorProfile = (doctorId, data) => api.post(`/doctors/${doctorId}/profile`, data);
export const updateDoctorProfile = (doctorId, data) => api.put(`/doctors/${doctorId}/profile`, data);
export const deleteDoctorProfile = (doctorId) => api.delete(`/doctors/${doctorId}/profile`);
