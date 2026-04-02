using System.ComponentModel.DataAnnotations;

namespace HospitalManagementAPI.Models
{
    public class Patient
    {
        [Key]
        public int PatientId { get; set; }

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
        [MaxLength(1)]
        [RegularExpression("^[MF]$", ErrorMessage = "Gender must be M or F")]
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

        public int? InsuranceId { get; set; }
        public Insurance? Insurance { get; set; }

        public ICollection<Appointment> Appointments { get; set; } = new List<Appointment>();
        public ICollection<MedicalRecord> MedicalRecords { get; set; } = new List<MedicalRecord>();

        public string UserId { get; set; }
    }
}
