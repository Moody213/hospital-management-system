using System.ComponentModel.DataAnnotations;

namespace HospitalManagementAPI.Models
{
    public class Doctor
    {
        [Key]
        public int DoctorId { get; set; }

        [Required]
        [MaxLength(100)]
        public string FirstName { get; set; }

        [Required]
        [MaxLength(100)]
        public string LastName { get; set; }

        [Required]
        [MaxLength(20)]
        public string LicenseNumber { get; set; }

        [Required]
        [MaxLength(100)]
        public string Specialization { get; set; }

        [Required]
        [EmailAddress]
        public string Email { get; set; }

        [Required]
        [RegularExpression(@"^\d{10,15}$", ErrorMessage = "Phone number must be 10-15 digits")]
        public string PhoneNumber { get; set; }

        [Range(0, int.MaxValue)]
        public int YearsOfExperience { get; set; }

        public bool IsActive { get; set; } = true;

        public int? DoctorProfileId { get; set; }
        public DoctorProfile DoctorProfile { get; set; }

        public ICollection<Appointment> Appointments { get; set; } = new List<Appointment>();

        public string UserId { get; set; }
    }
}
