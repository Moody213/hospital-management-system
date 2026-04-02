using System.ComponentModel.DataAnnotations;

namespace HospitalManagementAPI.DTOs
{
    public class ScanCreateDto
    {
        [Required]
        public int MedicalRecordId { get; set; }

        [Required]
        [MaxLength(100)]
        public string ScanType { get; set; }

        [Required]
        public DateTime ScanDate { get; set; }

        [MaxLength(500)]
        public string FilePath { get; set; }

        [MaxLength(1000)]
        public string Diagnosis { get; set; }
    }

    public class ScanUpdateDto
    {
        [MaxLength(1000)]
        public string Diagnosis { get; set; }

        [MaxLength(20)]
        public string Status { get; set; }
    }

    public class ScanReadDto
    {
        public int ScanId { get; set; }
        public int MedicalRecordId { get; set; }
        public string ScanType { get; set; }
        public DateTime ScanDate { get; set; }
        public string FilePath { get; set; }
        public string Diagnosis { get; set; }
        public string Status { get; set; }
    }
}
