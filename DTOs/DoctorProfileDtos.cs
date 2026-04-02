using System.ComponentModel.DataAnnotations;

namespace HospitalManagementAPI.DTOs
{
    public class DoctorProfileCreateDto
    {
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
    }

    public class DoctorProfileUpdateDto
    {
        [MaxLength(500)]
        public string Bio { get; set; }

        [MaxLength(200)]
        public string Qualifications { get; set; }

        [MaxLength(200)]
        public string OfficeAddress { get; set; }

        [MaxLength(2000)]
        public string ClinicalInterests { get; set; }

        public bool? IsAvailableForTeleHealth { get; set; }
    }

    public class DoctorProfileReadDto
    {
        public int DoctorProfileId { get; set; }
        public string Bio { get; set; }
        public string Qualifications { get; set; }
        public string OfficeAddress { get; set; }
        public string ClinicalInterests { get; set; }
        public bool IsAvailableForTeleHealth { get; set; }
        public int DoctorId { get; set; }
    }
}
