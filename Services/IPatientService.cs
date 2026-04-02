using HospitalManagementAPI.DTOs;

namespace HospitalManagementAPI.Services
{
    public interface IPatientService
    {
        Task<PatientReadDto> GetPatientByIdAsync(int id);
        Task<IEnumerable<PatientReadDto>> GetAllPatientsAsync();
        Task<PatientReadDto> CreatePatientAsync(PatientCreateDto dto);
        Task<PatientReadDto> UpdatePatientAsync(int id, PatientUpdateDto dto);
        Task<bool> DeletePatientAsync(int id);
    }
}
