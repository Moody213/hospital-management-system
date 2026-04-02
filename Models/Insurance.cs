using System.ComponentModel.DataAnnotations;

namespace HospitalManagementAPI.Models
{
    public class Insurance
    {
        [Key]
        public int InsuranceId { get; set; }

        [Required]
        [MaxLength(100)]
        public string ProviderName { get; set; }

        [Required]
        [MaxLength(50)]
        public string PolicyNumber { get; set; }

        [MaxLength(50)]
        public string GroupNumber { get; set; }

        [Required]
        public DateTime PolicyStartDate { get; set; }

        [Required]
        public DateTime PolicyEndDate { get; set; }

        [Range(0, 1000000)]
        public decimal CoverageAmount { get; set; }

        [Range(0, 100000)]
        public decimal Deductible { get; set; }

        [MaxLength(500)]
        public string CoverageDetails { get; set; }

        public int? PatientId { get; set; }
        public Patient? Patient { get; set; }
    }
}
