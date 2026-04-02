using HospitalManagementAPI.Data;
using HospitalManagementAPI.Models;
using Microsoft.EntityFrameworkCore;

namespace HospitalManagementAPI.Repositories
{
    public class PatientRepository : GenericRepository<Patient>, IPatientRepository
    {
        private readonly ApplicationDbContext _context;

        public PatientRepository(ApplicationDbContext context) : base(context)
        {
            _context = context;
        }

        public async Task<Patient> GetPatientWithInsuranceAsync(int id)
        {
            return await _context.Patients
                .AsNoTracking()
                .Include(p => p.Insurance)
                .FirstOrDefaultAsync(p => p.PatientId == id);
        }

        public async Task<Patient> GetByEmailAsync(string email)
        {
            return await _context.Patients
                .AsNoTracking()
                .FirstOrDefaultAsync(p => p.Email == email);
        }
    }
}
