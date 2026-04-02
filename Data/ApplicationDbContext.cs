using Microsoft.AspNetCore.Identity.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore;
using HospitalManagementAPI.Models;

namespace HospitalManagementAPI.Data
{
    public class ApplicationDbContext : IdentityDbContext<ApplicationUser>
    {
        public ApplicationDbContext(DbContextOptions<ApplicationDbContext> options) : base(options) { }

        public DbSet<Doctor> Doctors { get; set; }
        public DbSet<DoctorProfile> DoctorProfiles { get; set; }
        public DbSet<Patient> Patients { get; set; }
        public DbSet<Appointment> Appointments { get; set; }
        public DbSet<MedicalRecord> MedicalRecords { get; set; }
        public DbSet<Scan> Scans { get; set; }
        public DbSet<Insurance> Insurances { get; set; }
        public DbSet<RefreshToken> RefreshTokens { get; set; }

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            base.OnModelCreating(modelBuilder);

            // One-to-One: Doctor ↔ DoctorProfile
            modelBuilder.Entity<Doctor>()
                .HasOne(d => d.DoctorProfile)
                .WithOne(dp => dp.Doctor)
                .HasForeignKey<DoctorProfile>(dp => dp.DoctorId)
                .OnDelete(DeleteBehavior.Cascade);

            // One-to-One: Patient ↔ Insurance
            modelBuilder.Entity<Patient>()
                .HasOne(p => p.Insurance)
                .WithOne(i => i.Patient)
                .HasForeignKey<Insurance>(i => i.PatientId)
                .OnDelete(DeleteBehavior.SetNull);

            // One-to-Many: Doctor → Appointments
            modelBuilder.Entity<Doctor>()
                .HasMany(d => d.Appointments)
                .WithOne(a => a.Doctor)
                .HasForeignKey(a => a.DoctorId)
                .OnDelete(DeleteBehavior.Restrict);

            // One-to-Many: Patient → Appointments (Many-to-Many resolver)
            modelBuilder.Entity<Patient>()
                .HasMany(p => p.Appointments)
                .WithOne(a => a.Patient)
                .HasForeignKey(a => a.PatientId)
                .OnDelete(DeleteBehavior.Cascade);

            // One-to-Many: Patient → MedicalRecords
            modelBuilder.Entity<Patient>()
                .HasMany(p => p.MedicalRecords)
                .WithOne(mr => mr.Patient)
                .HasForeignKey(mr => mr.PatientId)
                .OnDelete(DeleteBehavior.Cascade);

            // One-to-Many: MedicalRecord → Scans
            modelBuilder.Entity<MedicalRecord>()
                .HasMany(mr => mr.Scans)
                .WithOne(s => s.MedicalRecord)
                .HasForeignKey(s => s.MedicalRecordId)
                .OnDelete(DeleteBehavior.Cascade);

            // Indices for performance
            modelBuilder.Entity<Appointment>().HasIndex(a => a.DoctorId);
            modelBuilder.Entity<Appointment>().HasIndex(a => a.PatientId);
            modelBuilder.Entity<MedicalRecord>().HasIndex(mr => mr.PatientId);
            modelBuilder.Entity<Scan>().HasIndex(s => s.MedicalRecordId);
            modelBuilder.Entity<RefreshToken>().HasIndex(rt => rt.UserId);
        }
    }
}
