using HospitalManagementAPI.Models;

namespace HospitalManagementAPI.Repositories
{
    public interface IAppointmentRepository : IGenericRepository<Appointment>
    {
        Task<IEnumerable<Appointment>> GetDoctorAppointmentsAsync(int doctorId);
        Task<IEnumerable<Appointment>> GetPatientAppointmentsAsync(int patientId);
        Task<Appointment> GetAppointmentWithDetailsAsync(int id);
    }
}
