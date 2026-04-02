using HospitalManagementAPI.DTOs;
using HospitalManagementAPI.Services;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authorization;

namespace HospitalManagementAPI.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize]
    public class MedicalRecordsController : ControllerBase
    {
        private readonly IMedicalRecordService _service;

        public MedicalRecordsController(IMedicalRecordService service)
        {
            _service = service;
        }

        [HttpGet("{id}")]
        public async Task<ActionResult<MedicalRecordReadDto>> GetRecordById(int id)
        {
            var record = await _service.GetRecordByIdAsync(id);
            if (record == null)
                return NotFound();

            return Ok(record);
        }

        [HttpGet("patient/{patientId}")]
        public async Task<ActionResult<IEnumerable<MedicalRecordReadDto>>> GetPatientRecords(int patientId)
        {
            var records = await _service.GetPatientRecordsAsync(patientId);
            return Ok(records);
        }

        [HttpPost]
        [Authorize(Roles = "Admin,Doctor")]
        public async Task<ActionResult<MedicalRecordReadDto>> CreateRecord([FromBody] MedicalRecordCreateDto dto)
        {
            if (!ModelState.IsValid)
                return BadRequest(ModelState);

            var record = await _service.CreateRecordAsync(dto);
            return CreatedAtAction(nameof(GetRecordById), new { id = record.MedicalRecordId }, record);
        }

        [HttpPut("{id}")]
        [Authorize(Roles = "Admin,Doctor")]
        public async Task<IActionResult> UpdateRecord(int id, [FromBody] MedicalRecordUpdateDto dto)
        {
            if (!ModelState.IsValid)
                return BadRequest(ModelState);

            try
            {
                var record = await _service.UpdateRecordAsync(id, dto);
                return Ok(record);
            }
            catch (KeyNotFoundException)
            {
                return NotFound();
            }
        }

        [HttpDelete("{id}")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> DeleteRecord(int id)
        {
            var result = await _service.DeleteRecordAsync(id);
            if (!result)
                return NotFound();

            return NoContent();
        }
    }
}
