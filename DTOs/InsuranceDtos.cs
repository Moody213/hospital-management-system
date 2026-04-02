using System.ComponentModel.DataAnnotations;

namespace HospitalManagementAPI.DTOs
{
    public class InsuranceCreateDto
    {
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
    }

    public class InsuranceUpdateDto
    {
        [MaxLength(100)]
        public string ProviderName { get; set; }

        [MaxLength(50)]
        public string PolicyNumber { get; set; }

        [MaxLength(50)]
        public string GroupNumber { get; set; }

        public DateTime? PolicyEndDate { get; set; }

        [Range(0, 1000000)]
        public decimal? CoverageAmount { get; set; }

        [Range(0, 100000)]
        public decimal? Deductible { get; set; }

        [MaxLength(500)]
        public string CoverageDetails { get; set; }
    }

    public class InsuranceReadDto
    {
        public int InsuranceId { get; set; }
        public string ProviderName { get; set; }
        public string PolicyNumber { get; set; }
        public string GroupNumber { get; set; }
        public DateTime PolicyStartDate { get; set; }
        public DateTime PolicyEndDate { get; set; }
        public decimal CoverageAmount { get; set; }
        public decimal Deductible { get; set; }
        public string CoverageDetails { get; set; }
    }
}
