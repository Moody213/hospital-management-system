using HospitalManagementAPI.Data;
using HospitalManagementAPI.Models;
using Microsoft.EntityFrameworkCore;

namespace HospitalManagementAPI.Repositories
{
    public class MedicalRecordRepository : GenericRepository<MedicalRecord>, IMedicalRecordRepository
    {
        private readonly ApplicationDbContext _context;

        public MedicalRecordRepository(ApplicationDbContext context) : base(context)
        {
            _context = context;
        }

        public async Task<IEnumerable<MedicalRecord>> GetPatientRecordsAsync(int patientId)
        {
            return await _context.MedicalRecords
                .AsNoTracking()
                .Where(mr => mr.PatientId == patientId)
                .Include(mr => mr.Scans)
                .OrderByDescending(mr => mr.RecordDate)
                .ToListAsync();
        }

        public async Task<MedicalRecord> GetRecordWithScansAsync(int id)
        {
            return await _context.MedicalRecords
                .AsNoTracking()
                .Include(mr => mr.Scans)
                .FirstOrDefaultAsync(mr => mr.MedicalRecordId == id);
        }
    }
}
