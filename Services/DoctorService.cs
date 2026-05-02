using HospitalManagementAPI.Data;
using HospitalManagementAPI.DTOs;
using HospitalManagementAPI.Models;
using HospitalManagementAPI.Repositories;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;

namespace HospitalManagementAPI.Services
{
    public class DoctorService : IDoctorService
    {
        private readonly IDoctorRepository _repository;
        private readonly UserManager<ApplicationUser> _userManager;
        private readonly ApplicationDbContext _context;

        public DoctorService(IDoctorRepository repository, UserManager<ApplicationUser> userManager, ApplicationDbContext context)
        {
            _repository = repository;
            _userManager = userManager;
            _context = context;
        }

        public async Task<DoctorReadDto> GetDoctorByIdAsync(int id)
        {
            var doctor = await _repository.GetDoctorWithProfileAsync(id);
            return doctor == null ? null : MapToReadDto(doctor);
        }

        public async Task<DoctorReadDto> GetDoctorByUserIdAsync(string userId)
        {
            var doctor = await _context.Doctors
                .Include(d => d.DoctorProfile)
                .FirstOrDefaultAsync(d => d.UserId == userId);
            return doctor == null ? null : MapToReadDto(doctor);
        }

        public async Task<IEnumerable<DoctorReadDto>> GetAllDoctorsAsync()
        {
            var doctors = await _context.Doctors
                .AsNoTracking()
                .Include(d => d.DoctorProfile)
                .Where(d => d.IsActive)
                .ToListAsync();

            return doctors.Select(MapToReadDto);
        }

        public async Task<IEnumerable<DoctorReadDto>> GetDoctorsBySpecializationAsync(string specialization)
        {
            var doctors = await _repository.GetDoctorsBySpecializationAsync(specialization);
            return doctors.Select(MapToReadDto);
        }

        public async Task<DoctorReadDto> CreateDoctorAsync(DoctorCreateDto dto)
        {
            var user = new ApplicationUser
            {
                Email = dto.Email,
                UserName = dto.Email,
                FirstName = dto.FirstName,
                LastName = dto.LastName
            };

            var result = await _userManager.CreateAsync(user, dto.Password);
            if (!result.Succeeded)
                throw new InvalidOperationException(string.Join("; ", result.Errors.Select(e => e.Description)));

            await _userManager.AddToRoleAsync(user, "Doctor");

            var doctor = new Doctor
            {
                FirstName = dto.FirstName,
                LastName = dto.LastName,
                LicenseNumber = dto.LicenseNumber,
                Specialization = dto.Specialization,
                Email = dto.Email,
                PhoneNumber = dto.PhoneNumber,
                YearsOfExperience = dto.YearsOfExperience,
                UserId = user.Id
            };

            await _repository.AddAsync(doctor);
            await _repository.SaveAsync();

            return MapToReadDto(doctor);
        }

        public async Task<DoctorReadDto> UpdateDoctorAsync(int id, DoctorUpdateDto dto)
        {
            var doctor = await _repository.GetByIdAsync(id);
            if (doctor == null)
                throw new KeyNotFoundException("Doctor not found");

            if (!string.IsNullOrEmpty(dto.FirstName))
                doctor.FirstName = dto.FirstName;
            if (!string.IsNullOrEmpty(dto.LastName))
                doctor.LastName = dto.LastName;
            if (!string.IsNullOrEmpty(dto.Specialization))
                doctor.Specialization = dto.Specialization;
            if (!string.IsNullOrEmpty(dto.PhoneNumber))
                doctor.PhoneNumber = dto.PhoneNumber;
            if (dto.YearsOfExperience.HasValue)
                doctor.YearsOfExperience = dto.YearsOfExperience.Value;
            if (dto.IsActive.HasValue)
                doctor.IsActive = dto.IsActive.Value;

            await _repository.UpdateAsync(doctor);
            var updated = await _repository.GetDoctorWithProfileAsync(id);
            return MapToReadDto(updated);
        }

        public async Task<bool> DeleteDoctorAsync(int id)
        {
            var doctor = await _repository.GetByIdAsync(id);
            if (doctor == null)
                return false;

            await _repository.DeleteAsync(doctor);
            return true;
        }

        private static DoctorReadDto MapToReadDto(Doctor doctor)
        {
            return new DoctorReadDto
            {
                DoctorId = doctor.DoctorId,
                FirstName = doctor.FirstName,
                LastName = doctor.LastName,
                Specialization = doctor.Specialization,
                Email = doctor.Email,
                PhoneNumber = doctor.PhoneNumber,
                YearsOfExperience = doctor.YearsOfExperience,
                IsActive = doctor.IsActive,
                DoctorProfile = doctor.DoctorProfile == null ? null : new DoctorProfileReadDto
                {
                    DoctorProfileId = doctor.DoctorProfile.DoctorProfileId,
                    Bio = doctor.DoctorProfile.Bio,
                    Qualifications = doctor.DoctorProfile.Qualifications,
                    OfficeAddress = doctor.DoctorProfile.OfficeAddress,
                    ClinicalInterests = doctor.DoctorProfile.ClinicalInterests,
                    IsAvailableForTeleHealth = doctor.DoctorProfile.IsAvailableForTeleHealth,
                    DoctorId = doctor.DoctorProfile.DoctorId
                }
            };
        }
    }
}
