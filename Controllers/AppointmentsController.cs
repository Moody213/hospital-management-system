using HospitalManagementAPI.DTOs;
using HospitalManagementAPI.Services;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authorization;

namespace HospitalManagementAPI.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize]
    public class AppointmentsController : ControllerBase
    {
        private readonly IAppointmentService _service;

        public AppointmentsController(IAppointmentService service)
        {
            _service = service;
        }

        [HttpGet]
        [Authorize(Roles = "Admin")]
        public async Task<ActionResult<IEnumerable<AppointmentReadDto>>> GetAllAppointments()
        {
            var appointments = await _service.GetAllAppointmentsAsync();
            return Ok(appointments);
        }

        [HttpGet("{id}")]
        public async Task<ActionResult<AppointmentReadDto>> GetAppointmentById(int id)
        {
            var appointment = await _service.GetAppointmentByIdAsync(id);
            if (appointment == null)
                return NotFound();

            return Ok(appointment);
        }

        [HttpGet("doctor/{doctorId}")]
        public async Task<ActionResult<IEnumerable<AppointmentReadDto>>> GetDoctorAppointments(int doctorId)
        {
            var appointments = await _service.GetDoctorAppointmentsAsync(doctorId);
            return Ok(appointments);
        }

        [HttpGet("patient/{patientId}")]
        public async Task<ActionResult<IEnumerable<AppointmentReadDto>>> GetPatientAppointments(int patientId)
        {
            var appointments = await _service.GetPatientAppointmentsAsync(patientId);
            return Ok(appointments);
        }

        [HttpPost]
        [Authorize(Roles = "Admin,Patient")]
        public async Task<ActionResult<AppointmentReadDto>> CreateAppointment([FromBody] AppointmentCreateDto dto)
        {
            if (!ModelState.IsValid)
                return BadRequest(ModelState);

            try
            {
                var appointment = await _service.CreateAppointmentAsync(dto);
                return CreatedAtAction(nameof(GetAppointmentById), new { id = appointment.AppointmentId }, appointment);
            }
            catch (InvalidOperationException ex)
            {
                return Conflict(new { message = ex.Message });
            }
        }

        [HttpPut("{id}")]
        [Authorize(Roles = "Admin,Doctor,Patient")]
        public async Task<IActionResult> UpdateAppointment(int id, [FromBody] AppointmentUpdateDto dto)
        {
            if (!ModelState.IsValid)
                return BadRequest(ModelState);

            try
            {
                var appointment = await _service.UpdateAppointmentAsync(id, dto);
                return Ok(appointment);
            }
            catch (KeyNotFoundException)
            {
                return NotFound();
            }
            catch (InvalidOperationException ex)
            {
                return Conflict(new { message = ex.Message });
            }
        }

        [HttpDelete("{id}")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> DeleteAppointment(int id)
        {
            var result = await _service.DeleteAppointmentAsync(id);
            if (!result)
                return NotFound();

            return NoContent();
        }
    }
}
