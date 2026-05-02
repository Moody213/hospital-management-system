using HospitalManagementAPI.DTOs;
using HospitalManagementAPI.Services;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authorization;

namespace HospitalManagementAPI.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize]
    public class DoctorsController : ControllerBase
    {
        private readonly IDoctorService _service;

        public DoctorsController(IDoctorService service)
        {
            _service = service;
        }

        [HttpGet]
        public async Task<ActionResult<IEnumerable<DoctorReadDto>>> GetAllDoctors()
        {
            var doctors = await _service.GetAllDoctorsAsync();
            return Ok(doctors);
        }

        [HttpGet("me")]
        [Authorize(Roles = "Doctor")]
        public async Task<ActionResult<DoctorReadDto>> GetMyProfile()
        {
            var userId = User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)?.Value;
            if (userId == null) return Unauthorized();
            var doctor = await _service.GetDoctorByUserIdAsync(userId);
            if (doctor == null) return NotFound();
            return Ok(doctor);
        }

        [HttpGet("{id}")]
        public async Task<ActionResult<DoctorReadDto>> GetDoctorById(int id)
        {
            var doctor = await _service.GetDoctorByIdAsync(id);
            if (doctor == null)
                return NotFound();

            return Ok(doctor);
        }

        [HttpGet("specialization/{specialization}")]
        public async Task<ActionResult<IEnumerable<DoctorReadDto>>> GetBySpecialization(string specialization)
        {
            var doctors = await _service.GetDoctorsBySpecializationAsync(specialization);
            return Ok(doctors);
        }

        [HttpPost]
        [Authorize(Roles = "Admin")]
        public async Task<ActionResult<DoctorReadDto>> CreateDoctor([FromBody] DoctorCreateDto dto)
        {
            if (!ModelState.IsValid)
                return BadRequest(ModelState);

            try
            {
                var doctor = await _service.CreateDoctorAsync(dto);
                return CreatedAtAction(nameof(GetDoctorById), new { id = doctor.DoctorId }, doctor);
            }
            catch (InvalidOperationException ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }

        [HttpPut("{id}")]
        [Authorize(Roles = "Admin,Doctor")]
        public async Task<IActionResult> UpdateDoctor(int id, [FromBody] DoctorUpdateDto dto)
        {
            if (!ModelState.IsValid)
                return BadRequest(ModelState);

            try
            {
                var doctor = await _service.UpdateDoctorAsync(id, dto);
                return Ok(doctor);
            }
            catch (KeyNotFoundException)
            {
                return NotFound();
            }
        }

        [HttpDelete("{id}")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> DeleteDoctor(int id)
        {
            var result = await _service.DeleteDoctorAsync(id);
            if (!result)
                return NotFound();

            return NoContent();
        }
    }
}
