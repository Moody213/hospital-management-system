using HospitalManagementAPI.Models;

namespace HospitalManagementAPI.Repositories
{
    public interface IDoctorRepository : IGenericRepository<Doctor>
    {
        Task<Doctor> GetDoctorWithProfileAsync(int id);
        Task<IEnumerable<Doctor>> GetDoctorsBySpecializationAsync(string specialization);
        Task<Doctor> GetByEmailAsync(string email);
    }
}
