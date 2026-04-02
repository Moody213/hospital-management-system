using System.ComponentModel.DataAnnotations;

namespace HospitalManagementAPI.DTOs
{
    public class MedicalRecordCreateDto
    {
        [Required]
        public int PatientId { get; set; }

        [Required]
        [MaxLength(100)]
        public string Diagnosis { get; set; }

        [Required]
        public DateTime RecordDate { get; set; }

        [MaxLength(1000)]
        public string Symptoms { get; set; }

        [MaxLength(1000)]
        public string Treatment { get; set; }

        [MaxLength(500)]
        public string Prescriptions { get; set; }

        [MaxLength(500)]
        public string Notes { get; set; }
    }

    public class MedicalRecordUpdateDto
    {
        [MaxLength(100)]
        public string Diagnosis { get; set; }

        [MaxLength(1000)]
        public string Symptoms { get; set; }

        [MaxLength(1000)]
        public string Treatment { get; set; }

        [MaxLength(500)]
        public string Prescriptions { get; set; }

        [MaxLength(500)]
        public string Notes { get; set; }
    }

    public class MedicalRecordReadDto
    {
        public int MedicalRecordId { get; set; }
        public int PatientId { get; set; }
        public string Diagnosis { get; set; }
        public DateTime RecordDate { get; set; }
        public string Symptoms { get; set; }
        public string Treatment { get; set; }
        public string Prescriptions { get; set; }
        public string Notes { get; set; }
        public List<ScanReadDto> Scans { get; set; }
    }
}
