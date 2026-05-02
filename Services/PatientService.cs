using HospitalManagementAPI.Data;
using HospitalManagementAPI.DTOs;
using HospitalManagementAPI.Models;
using HospitalManagementAPI.Repositories;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;

namespace HospitalManagementAPI.Services
{
    public class PatientService : IPatientService
    {
        private readonly IPatientRepository _repository;
        private readonly UserManager<ApplicationUser> _userManager;
        private readonly ApplicationDbContext _context;

        public PatientService(IPatientRepository repository, UserManager<ApplicationUser> userManager, ApplicationDbContext context)
        {
            _repository = repository;
            _userManager = userManager;
            _context = context;
        }

        public async Task<PatientReadDto> GetPatientByIdAsync(int id)
        {
            var patient = await _repository.GetPatientWithInsuranceAsync(id);
            return patient == null ? null : MapToReadDto(patient);
        }

        public async Task<PatientReadDto> GetPatientByUserIdAsync(string userId)
        {
            var patient = await _context.Patients
                .Include(p => p.Insurance)
                .FirstOrDefaultAsync(p => p.UserId == userId);
            return patient == null ? null : MapToReadDto(patient);
        }

        public async Task<IEnumerable<PatientReadDto>> GetAllPatientsAsync()
        {
            var patients = await _context.Patients
                .AsNoTracking()
                .Include(p => p.Insurance)
                .ToListAsync();

            return patients.Select(MapToReadDto);
        }

        public async Task<PatientReadDto> CreatePatientAsync(PatientCreateDto dto)
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

            await _userManager.AddToRoleAsync(user, "Patient");

            var patient = new Patient
            {
                FirstName = dto.FirstName,
                LastName = dto.LastName,
                Age = dto.Age,
                Gender = dto.Gender,
                Email = dto.Email,
                PhoneNumber = dto.PhoneNumber,
                Address = dto.Address,
                BloodType = dto.BloodType,
                EmergencyContactName = dto.EmergencyContactName,
                EmergencyContactPhone = dto.EmergencyContactPhone,
                UserId = user.Id
            };

            await _repository.AddAsync(patient);
            await _repository.SaveAsync();

            return MapToReadDto(patient);
        }

        public async Task<PatientReadDto> UpdatePatientAsync(int id, PatientUpdateDto dto)
        {
            var patient = await _repository.GetByIdAsync(id);
            if (patient == null)
                throw new KeyNotFoundException("Patient not found");

            if (!string.IsNullOrEmpty(dto.FirstName))
                patient.FirstName = dto.FirstName;
            if (!string.IsNullOrEmpty(dto.LastName))
                patient.LastName = dto.LastName;
            if (dto.Age.HasValue)
                patient.Age = dto.Age.Value;
            if (!string.IsNullOrEmpty(dto.PhoneNumber))
                patient.PhoneNumber = dto.PhoneNumber;
            if (!string.IsNullOrEmpty(dto.Address))
                patient.Address = dto.Address;
            if (!string.IsNullOrEmpty(dto.BloodType))
                patient.BloodType = dto.BloodType;
            if (!string.IsNullOrEmpty(dto.EmergencyContactName))
                patient.EmergencyContactName = dto.EmergencyContactName;
            if (!string.IsNullOrEmpty(dto.EmergencyContactPhone))
                patient.EmergencyContactPhone = dto.EmergencyContactPhone;

            await _repository.UpdateAsync(patient);
            var updated = await _repository.GetPatientWithInsuranceAsync(id);
            return MapToReadDto(updated);
        }

        public async Task<bool> DeletePatientAsync(int id)
        {
            var patient = await _repository.GetByIdAsync(id);
            if (patient == null)
                return false;

            await _repository.DeleteAsync(patient);
            return true;
        }

        private static PatientReadDto MapToReadDto(Patient patient)
        {
            return new PatientReadDto
            {
                PatientId = patient.PatientId,
                FirstName = patient.FirstName,
                LastName = patient.LastName,
                Age = patient.Age,
                Gender = patient.Gender,
                Email = patient.Email,
                PhoneNumber = patient.PhoneNumber,
                Address = patient.Address,
                BloodType = patient.BloodType,
                EmergencyContactName = patient.EmergencyContactName,
                EmergencyContactPhone = patient.EmergencyContactPhone,
                Insurance = patient.Insurance == null ? null : new InsuranceReadDto
                {
                    InsuranceId = patient.Insurance.InsuranceId,
                    ProviderName = patient.Insurance.ProviderName,
                    PolicyNumber = patient.Insurance.PolicyNumber,
                    GroupNumber = patient.Insurance.GroupNumber,
                    PolicyStartDate = patient.Insurance.PolicyStartDate,
                    PolicyEndDate = patient.Insurance.PolicyEndDate,
                    CoverageAmount = patient.Insurance.CoverageAmount,
                    Deductible = patient.Insurance.Deductible,
                    CoverageDetails = patient.Insurance.CoverageDetails
                }
            };
        }
    }
}
