using HospitalManagementAPI.Models;

namespace HospitalManagementAPI.Repositories
{
    public interface IPatientRepository : IGenericRepository<Patient>
    {
        Task<Patient> GetPatientWithInsuranceAsync(int id);
        Task<Patient> GetByEmailAsync(string email);
    }
}
