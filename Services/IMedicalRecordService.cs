using HospitalManagementAPI.DTOs;

namespace HospitalManagementAPI.Services
{
    public interface IMedicalRecordService
    {
        Task<MedicalRecordReadDto> GetRecordByIdAsync(int id);
        Task<IEnumerable<MedicalRecordReadDto>> GetPatientRecordsAsync(int patientId);
        Task<MedicalRecordReadDto> CreateRecordAsync(MedicalRecordCreateDto dto);
        Task<MedicalRecordReadDto> UpdateRecordAsync(int id, MedicalRecordUpdateDto dto);
        Task<bool> DeleteRecordAsync(int id);
    }
}
