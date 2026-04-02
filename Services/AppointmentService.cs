using HospitalManagementAPI.Data;
using HospitalManagementAPI.DTOs;
using HospitalManagementAPI.Models;
using HospitalManagementAPI.Repositories;
using Microsoft.EntityFrameworkCore;

namespace HospitalManagementAPI.Services
{
    public class AppointmentService : IAppointmentService
    {
        private readonly IAppointmentRepository _repository;
        private readonly ApplicationDbContext _context;

        public AppointmentService(IAppointmentRepository repository, ApplicationDbContext context)
        {
            _repository = repository;
            _context = context;
        }

        public async Task<AppointmentReadDto> GetAppointmentByIdAsync(int id)
        {
            var appointment = await _repository.GetAppointmentWithDetailsAsync(id);
            return appointment == null ? null : MapToReadDto(appointment);
        }

        public async Task<IEnumerable<AppointmentReadDto>> GetAllAppointmentsAsync()
        {
            var appointments = await _context.Appointments
                .AsNoTracking()
                .Include(a => a.Doctor)
                .Include(a => a.Patient)
                .ToListAsync();

            return appointments.Select(MapToReadDto);
        }

        public async Task<IEnumerable<AppointmentReadDto>> GetDoctorAppointmentsAsync(int doctorId)
        {
            var appointments = await _repository.GetDoctorAppointmentsAsync(doctorId);
            return appointments.Select(MapToReadDto);
        }

        public async Task<IEnumerable<AppointmentReadDto>> GetPatientAppointmentsAsync(int patientId)
        {
            var appointments = await _repository.GetPatientAppointmentsAsync(patientId);
            return appointments.Select(MapToReadDto);
        }

        public async Task<AppointmentReadDto> CreateAppointmentAsync(AppointmentCreateDto dto)
        {
            var appointment = new Appointment
            {
                DoctorId = dto.DoctorId,
                PatientId = dto.PatientId,
                AppointmentDate = dto.AppointmentDate,
                TimeSlot = dto.TimeSlot,
                Reason = dto.Reason,
                Notes = dto.Notes,
                Status = "Scheduled"
            };

            await _repository.AddAsync(appointment);
            await _repository.SaveAsync();

            var created = await _repository.GetAppointmentWithDetailsAsync(appointment.AppointmentId);
            return MapToReadDto(created);
        }

        public async Task<AppointmentReadDto> UpdateAppointmentAsync(int id, AppointmentUpdateDto dto)
        {
            var appointment = await _repository.GetByIdAsync(id);
            if (appointment == null)
                throw new KeyNotFoundException("Appointment not found");

            if (dto.AppointmentDate.HasValue)
                appointment.AppointmentDate = dto.AppointmentDate.Value;
            if (!string.IsNullOrEmpty(dto.TimeSlot))
                appointment.TimeSlot = dto.TimeSlot;
            if (!string.IsNullOrEmpty(dto.Reason))
                appointment.Reason = dto.Reason;
            if (!string.IsNullOrEmpty(dto.Status))
                appointment.Status = dto.Status;
            if (!string.IsNullOrEmpty(dto.Notes))
                appointment.Notes = dto.Notes;

            appointment.UpdatedAt = DateTime.UtcNow;
            await _repository.UpdateAsync(appointment);

            var updated = await _repository.GetAppointmentWithDetailsAsync(id);
            return MapToReadDto(updated);
        }

        public async Task<bool> DeleteAppointmentAsync(int id)
        {
            var appointment = await _repository.GetByIdAsync(id);
            if (appointment == null)
                return false;

            await _repository.DeleteAsync(appointment);
            return true;
        }

        private static AppointmentReadDto MapToReadDto(Appointment appointment)
        {
            return new AppointmentReadDto
            {
                AppointmentId = appointment.AppointmentId,
                DoctorId = appointment.DoctorId,
                PatientId = appointment.PatientId,
                AppointmentDate = appointment.AppointmentDate,
                TimeSlot = appointment.TimeSlot,
                Reason = appointment.Reason,
                Status = appointment.Status,
                Notes = appointment.Notes,
                CreatedAt = appointment.CreatedAt,
                UpdatedAt = appointment.UpdatedAt,
                Doctor = appointment.Doctor == null ? null : new DoctorReadDto
                {
                    DoctorId = appointment.Doctor.DoctorId,
                    FirstName = appointment.Doctor.FirstName,
                    LastName = appointment.Doctor.LastName,
                    Specialization = appointment.Doctor.Specialization,
                    Email = appointment.Doctor.Email,
                    PhoneNumber = appointment.Doctor.PhoneNumber,
                    YearsOfExperience = appointment.Doctor.YearsOfExperience,
                    IsActive = appointment.Doctor.IsActive
                },
                Patient = appointment.Patient == null ? null : new PatientReadDto
                {
                    PatientId = appointment.Patient.PatientId,
                    FirstName = appointment.Patient.FirstName,
                    LastName = appointment.Patient.LastName,
                    Age = appointment.Patient.Age,
                    Gender = appointment.Patient.Gender,
                    Email = appointment.Patient.Email,
                    PhoneNumber = appointment.Patient.PhoneNumber,
                    Address = appointment.Patient.Address,
                    BloodType = appointment.Patient.BloodType,
                    EmergencyContactName = appointment.Patient.EmergencyContactName,
                    EmergencyContactPhone = appointment.Patient.EmergencyContactPhone
                }
            };
        }
    }
}
