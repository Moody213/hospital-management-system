using HospitalManagementAPI.DTOs;

namespace HospitalManagementAPI.Services
{
    public interface IAppointmentService
    {
        Task<AppointmentReadDto> GetAppointmentByIdAsync(int id);
        Task<IEnumerable<AppointmentReadDto>> GetAllAppointmentsAsync();
        Task<IEnumerable<AppointmentReadDto>> GetDoctorAppointmentsAsync(int doctorId);
        Task<IEnumerable<AppointmentReadDto>> GetPatientAppointmentsAsync(int patientId);
        Task<AppointmentReadDto> CreateAppointmentAsync(AppointmentCreateDto dto);
        Task<AppointmentReadDto> UpdateAppointmentAsync(int id, AppointmentUpdateDto dto);
        Task<bool> DeleteAppointmentAsync(int id);
    }
}
