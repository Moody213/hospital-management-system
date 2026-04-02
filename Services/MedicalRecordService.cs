using HospitalManagementAPI.DTOs;
using HospitalManagementAPI.Models;
using HospitalManagementAPI.Repositories;

namespace HospitalManagementAPI.Services
{
    public class MedicalRecordService : IMedicalRecordService
    {
        private readonly IMedicalRecordRepository _repository;

        public MedicalRecordService(IMedicalRecordRepository repository)
        {
            _repository = repository;
        }

        public async Task<MedicalRecordReadDto> GetRecordByIdAsync(int id)
        {
            var record = await _repository.GetRecordWithScansAsync(id);
            return record == null ? null : MapToReadDto(record);
        }

        public async Task<IEnumerable<MedicalRecordReadDto>> GetPatientRecordsAsync(int patientId)
        {
            var records = await _repository.GetPatientRecordsAsync(patientId);
            return records.Select(MapToReadDto);
        }

        public async Task<MedicalRecordReadDto> CreateRecordAsync(MedicalRecordCreateDto dto)
        {
            var record = new MedicalRecord
            {
                PatientId = dto.PatientId,
                Diagnosis = dto.Diagnosis,
                RecordDate = dto.RecordDate,
                Symptoms = dto.Symptoms,
                Treatment = dto.Treatment,
                Prescriptions = dto.Prescriptions,
                Notes = dto.Notes
            };

            await _repository.AddAsync(record);
            await _repository.SaveAsync();

            var created = await _repository.GetRecordWithScansAsync(record.MedicalRecordId);
            return MapToReadDto(created);
        }

        public async Task<MedicalRecordReadDto> UpdateRecordAsync(int id, MedicalRecordUpdateDto dto)
        {
            var record = await _repository.GetByIdAsync(id);
            if (record == null)
                throw new KeyNotFoundException("Medical record not found");

            if (!string.IsNullOrEmpty(dto.Diagnosis))
                record.Diagnosis = dto.Diagnosis;
            if (!string.IsNullOrEmpty(dto.Symptoms))
                record.Symptoms = dto.Symptoms;
            if (!string.IsNullOrEmpty(dto.Treatment))
                record.Treatment = dto.Treatment;
            if (!string.IsNullOrEmpty(dto.Prescriptions))
                record.Prescriptions = dto.Prescriptions;
            if (!string.IsNullOrEmpty(dto.Notes))
                record.Notes = dto.Notes;

            await _repository.UpdateAsync(record);
            var updated = await _repository.GetRecordWithScansAsync(id);
            return MapToReadDto(updated);
        }

        public async Task<bool> DeleteRecordAsync(int id)
        {
            var record = await _repository.GetByIdAsync(id);
            if (record == null)
                return false;

            await _repository.DeleteAsync(record);
            return true;
        }

        private static MedicalRecordReadDto MapToReadDto(MedicalRecord record)
        {
            return new MedicalRecordReadDto
            {
                MedicalRecordId = record.MedicalRecordId,
                PatientId = record.PatientId,
                Diagnosis = record.Diagnosis,
                RecordDate = record.RecordDate,
                Symptoms = record.Symptoms,
                Treatment = record.Treatment,
                Prescriptions = record.Prescriptions,
                Notes = record.Notes,
                Scans = record.Scans?.Select(s => new ScanReadDto
                {
                    ScanId = s.ScanId,
                    MedicalRecordId = s.MedicalRecordId,
                    ScanType = s.ScanType,
                    ScanDate = s.ScanDate,
                    FilePath = s.FilePath,
                    Diagnosis = s.Diagnosis,
                    Status = s.Status
                }).ToList() ?? new List<ScanReadDto>()
            };
        }
    }
}
