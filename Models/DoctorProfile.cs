using System.ComponentModel.DataAnnotations;

namespace HospitalManagementAPI.Models
{
    public class DoctorProfile
    {
        [Key]
        public int DoctorProfileId { get; set; }

        [Required]
        [MaxLength(500)]
        public string Bio { get; set; }

        [MaxLength(200)]
        public string Qualifications { get; set; }

        [MaxLength(200)]
        public string OfficeAddress { get; set; }

        [MaxLength(2000)]
        public string ClinicalInterests { get; set; }

        public bool IsAvailableForTeleHealth { get; set; }

        public int DoctorId { get; set; }
        public Doctor Doctor { get; set; }
    }
}
