using HospitalManagementAPI.Models;

namespace HospitalManagementAPI.Repositories
{
    public interface IMedicalRecordRepository : IGenericRepository<MedicalRecord>
    {
        Task<IEnumerable<MedicalRecord>> GetPatientRecordsAsync(int patientId);
        Task<MedicalRecord> GetRecordWithScansAsync(int id);
    }
}
