using System.ComponentModel.DataAnnotations;

namespace HospitalManagementAPI.DTOs
{
    public class PatientCreateDto
    {
        [Required]
        [MaxLength(100)]
        public string FirstName { get; set; }

        [Required]
        [MaxLength(100)]
        public string LastName { get; set; }

        [Required]
        [Range(1, 150)]
        public int Age { get; set; }

        [Required]
        [RegularExpression("^[MF]$")]
        public string Gender { get; set; }

        [Required]
        [EmailAddress]
        public string Email { get; set; }

        [Required]
        [RegularExpression(@"^\d{10,15}$")]
        public string PhoneNumber { get; set; }

        [Required]
        [MaxLength(200)]
        public string Address { get; set; }

        [MaxLength(50)]
        public string BloodType { get; set; }

        [MaxLength(500)]
        public string EmergencyContactName { get; set; }

        [RegularExpression(@"^\d{10,15}$")]
        public string EmergencyContactPhone { get; set; }

        [Required]
        [MinLength(8), MaxLength(100)]
        public string Password { get; set; }
    }

    public class PatientUpdateDto
    {
        [MaxLength(100)]
        public string FirstName { get; set; }

        [MaxLength(100)]
        public string LastName { get; set; }

        [Range(1, 150)]
        public int? Age { get; set; }

        [RegularExpression(@"^\d{10,15}$")]
        public string PhoneNumber { get; set; }

        [MaxLength(200)]
        public string Address { get; set; }

        [MaxLength(50)]
        public string BloodType { get; set; }

        [MaxLength(500)]
        public string EmergencyContactName { get; set; }

        [RegularExpression(@"^\d{10,15}$")]
        public string EmergencyContactPhone { get; set; }
    }

    public class PatientReadDto
    {
        public int PatientId { get; set; }
        public string FirstName { get; set; }
        public string LastName { get; set; }
        public int Age { get; set; }
        public string Gender { get; set; }
        public string Email { get; set; }
        public string PhoneNumber { get; set; }
        public string Address { get; set; }
        public string BloodType { get; set; }
        public string EmergencyContactName { get; set; }
        public string EmergencyContactPhone { get; set; }
        public InsuranceReadDto Insurance { get; set; }
    }
}
