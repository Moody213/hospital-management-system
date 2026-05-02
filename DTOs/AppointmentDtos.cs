using System.ComponentModel.DataAnnotations;

namespace HospitalManagementAPI.DTOs
{
    public class AppointmentCreateDto
    {
        [Required]
        public int DoctorId { get; set; }

        [Required]
        public int PatientId { get; set; }

        [Required]
        public DateTime AppointmentDate { get; set; }

        [MaxLength(500)]
        public string Reason { get; set; }

        [MaxLength(1000)]
        public string Notes { get; set; }
    }

    public class AppointmentUpdateDto
    {
        public DateTime? AppointmentDate { get; set; }

        [MaxLength(50)]
        public string TimeSlot { get; set; }

        [MaxLength(500)]
        public string Reason { get; set; }

        [MaxLength(20)]
        public string Status { get; set; }

        [MaxLength(1000)]
        public string Notes { get; set; }
    }

    public class AppointmentReadDto
    {
        public int AppointmentId { get; set; }
        public int DoctorId { get; set; }
        public int PatientId { get; set; }
        public DateTime AppointmentDate { get; set; }
        public string TimeSlot { get; set; }
        public string Reason { get; set; }
        public string Status { get; set; }
        public string Notes { get; set; }
        public DateTime CreatedAt { get; set; }
        public DateTime? UpdatedAt { get; set; }
        public DoctorReadDto Doctor { get; set; }
        public PatientReadDto Patient { get; set; }
    }
}
