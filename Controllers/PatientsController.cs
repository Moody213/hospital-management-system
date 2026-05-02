using HospitalManagementAPI.DTOs;
using HospitalManagementAPI.Services;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authorization;

namespace HospitalManagementAPI.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize]
    public class PatientsController : ControllerBase
    {
        private readonly IPatientService _service;

        public PatientsController(IPatientService service)
        {
            _service = service;
        }

        [HttpGet]
        [Authorize(Roles = "Admin,Doctor")]
        public async Task<ActionResult<IEnumerable<PatientReadDto>>> GetAllPatients()
        {
            var patients = await _service.GetAllPatientsAsync();
            return Ok(patients);
        }

        [HttpGet("me")]
        [Authorize(Roles = "Patient")]
        public async Task<ActionResult<PatientReadDto>> GetMyProfile()
        {
            var userId = User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)?.Value;
            if (userId == null) return Unauthorized();
            var patient = await _service.GetPatientByUserIdAsync(userId);
            if (patient == null) return NotFound();
            return Ok(patient);
        }

        [HttpGet("{id}")]
        public async Task<ActionResult<PatientReadDto>> GetPatientById(int id)
        {
            var patient = await _service.GetPatientByIdAsync(id);
            if (patient == null)
                return NotFound();

            return Ok(patient);
        }

        [HttpPost]
        [AllowAnonymous]
        public async Task<ActionResult<PatientReadDto>> CreatePatient([FromBody] PatientCreateDto dto)
        {
            if (!ModelState.IsValid)
                return BadRequest(ModelState);

            try
            {
                var patient = await _service.CreatePatientAsync(dto);
                return CreatedAtAction(nameof(GetPatientById), new { id = patient.PatientId }, patient);
            }
            catch (InvalidOperationException ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }

        [HttpPut("{id}")]
        [Authorize(Roles = "Admin,Patient")]
        public async Task<IActionResult> UpdatePatient(int id, [FromBody] PatientUpdateDto dto)
        {
            if (!ModelState.IsValid)
                return BadRequest(ModelState);

            try
            {
                var patient = await _service.UpdatePatientAsync(id, dto);
                return Ok(patient);
            }
            catch (KeyNotFoundException)
            {
                return NotFound();
            }
        }

        [HttpDelete("{id}")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> DeletePatient(int id)
        {
            var result = await _service.DeletePatientAsync(id);
            if (!result)
                return NotFound();

            return NoContent();
        }
    }
}
