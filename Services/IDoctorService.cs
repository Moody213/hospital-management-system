using HospitalManagementAPI.DTOs;

namespace HospitalManagementAPI.Services
{
    public interface IDoctorService
    {
        Task<DoctorReadDto> GetDoctorByIdAsync(int id);
        Task<IEnumerable<DoctorReadDto>> GetAllDoctorsAsync();
        Task<IEnumerable<DoctorReadDto>> GetDoctorsBySpecializationAsync(string specialization);
        Task<DoctorReadDto> CreateDoctorAsync(DoctorCreateDto dto);
        Task<DoctorReadDto> UpdateDoctorAsync(int id, DoctorUpdateDto dto);
        Task<bool> DeleteDoctorAsync(int id);
    }
}
