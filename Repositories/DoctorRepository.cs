using HospitalManagementAPI.Data;
using HospitalManagementAPI.Models;
using Microsoft.EntityFrameworkCore;

namespace HospitalManagementAPI.Repositories
{
    public class DoctorRepository : GenericRepository<Doctor>, IDoctorRepository
    {
        private readonly ApplicationDbContext _context;

        public DoctorRepository(ApplicationDbContext context) : base(context)
        {
            _context = context;
        }

        public async Task<Doctor> GetDoctorWithProfileAsync(int id)
        {
            return await _context.Doctors
                .AsNoTracking()
                .Include(d => d.DoctorProfile)
                .FirstOrDefaultAsync(d => d.DoctorId == id);
        }

        public async Task<IEnumerable<Doctor>> GetDoctorsBySpecializationAsync(string specialization)
        {
            return await _context.Doctors
                .AsNoTracking()
                .Where(d => d.Specialization == specialization && d.IsActive)
                .Include(d => d.DoctorProfile)
                .ToListAsync();
        }

        public async Task<Doctor> GetByEmailAsync(string email)
        {
            return await _context.Doctors
                .AsNoTracking()
                .FirstOrDefaultAsync(d => d.Email == email);
        }
    }
}
