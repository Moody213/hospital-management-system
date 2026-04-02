using System.ComponentModel.DataAnnotations;

namespace HospitalManagementAPI.DTOs
{
    public class DoctorCreateDto
    {
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
        [RegularExpression(@"^\d{10,15}$")]
        public string PhoneNumber { get; set; }

        [Range(0, 100)]
        public int YearsOfExperience { get; set; }

        [Required]
        [MinLength(8), MaxLength(100)]
        public string Password { get; set; }
    }

    public class DoctorUpdateDto
    {
        [MaxLength(100)]
        public string FirstName { get; set; }

        [MaxLength(100)]
        public string LastName { get; set; }

        [MaxLength(100)]
        public string Specialization { get; set; }

        [RegularExpression(@"^\d{10,15}$")]
        public string PhoneNumber { get; set; }

        [Range(0, 100)]
        public int? YearsOfExperience { get; set; }

        public bool? IsActive { get; set; }
    }

    public class DoctorReadDto
    {
        public int DoctorId { get; set; }
        public string FirstName { get; set; }
        public string LastName { get; set; }
        public string Specialization { get; set; }
        public string Email { get; set; }
        public string PhoneNumber { get; set; }
        public int YearsOfExperience { get; set; }
        public bool IsActive { get; set; }
        public DoctorProfileReadDto DoctorProfile { get; set; }
    }
}
