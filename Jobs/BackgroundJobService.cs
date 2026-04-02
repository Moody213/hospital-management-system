using HospitalManagementAPI.Data;
using Microsoft.EntityFrameworkCore;

namespace HospitalManagementAPI.Jobs
{
    public class BackgroundJobService
    {
        private readonly IServiceProvider _serviceProvider;
        private readonly ILogger<BackgroundJobService> _logger;

        public BackgroundJobService(IServiceProvider serviceProvider, ILogger<BackgroundJobService> logger)
        {
            _serviceProvider = serviceProvider;
            _logger = logger;
        }

        public async Task DeleteOldAppointmentsAsync()
        {
            using (var scope = _serviceProvider.CreateScope())
            {
                var context = scope.ServiceProvider.GetRequiredService<ApplicationDbContext>();
                var thirtyDaysAgo = DateTime.UtcNow.AddDays(-30);

                var oldAppointments = await context.Appointments
                    .Where(a => a.CreatedAt < thirtyDaysAgo && a.Status == "Completed")
                    .ToListAsync();

                if (oldAppointments.Any())
                {
                    context.Appointments.RemoveRange(oldAppointments);
                    await context.SaveChangesAsync();
                    _logger.LogInformation($"Deleted {oldAppointments.Count} old appointments");
                }
            }
        }

        public async Task SendAppointmentRemindersAsync()
        {
            using (var scope = _serviceProvider.CreateScope())
            {
                var context = scope.ServiceProvider.GetRequiredService<ApplicationDbContext>();
                var tomorrow = DateTime.UtcNow.AddDays(1).Date;

                var appointmentsToRemind = await context.Appointments
                    .Where(a => a.AppointmentDate.Date == tomorrow && a.Status == "Scheduled")
                    .Include(a => a.Patient)
                    .Include(a => a.Doctor)
                    .ToListAsync();

                _logger.LogInformation($"Sending reminders for {appointmentsToRemind.Count} appointments tomorrow");

                foreach (var appointment in appointmentsToRemind)
                {
                    _logger.LogInformation($"Reminder sent to {appointment.Patient.Email} for appointment with {appointment.Doctor.FirstName} {appointment.Doctor.LastName}");
                }
            }
        }
    }
}
