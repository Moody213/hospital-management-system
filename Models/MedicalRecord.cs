using System.ComponentModel.DataAnnotations;

namespace HospitalManagementAPI.Models
{
    public class MedicalRecord
    {
        [Key]
        public int MedicalRecordId { get; set; }

        public int PatientId { get; set; }
        public Patient Patient { get; set; }

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

        public ICollection<Scan> Scans { get; set; } = new List<Scan>();
    }
}
