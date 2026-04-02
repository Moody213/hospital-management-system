using System.ComponentModel.DataAnnotations;

namespace HospitalManagementAPI.Models
{
    public class Scan
    {
        [Key]
        public int ScanId { get; set; }

        public int MedicalRecordId { get; set; }
        public MedicalRecord MedicalRecord { get; set; }

        [Required]
        [MaxLength(100)]
        public string ScanType { get; set; }

        [Required]
        public DateTime ScanDate { get; set; }

        [MaxLength(500)]
        public string FilePath { get; set; }

        [MaxLength(1000)]
        public string Diagnosis { get; set; }

        [Required]
        [MaxLength(20)]
        public string Status { get; set; } = "Pending";
    }
}
