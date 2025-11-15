using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using NiveshX.Core.DTOs.Sector;
using NiveshX.Core.Interfaces.Services;

namespace NiveshX.API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize(Roles = "Admin")]
    public class SectorController : ControllerBase
    {
        private readonly ISectorService _service;
        private readonly ILogger<SectorController> _logger;

        public SectorController(ISectorService service, ILogger<SectorController> logger)
        {
            _service = service;
            _logger = logger;
        }

        [HttpGet]
        [ProducesResponseType(typeof(IEnumerable<SectorResponse>), StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status500InternalServerError)]
        public async Task<IActionResult> GetAll(CancellationToken cancellationToken)
        {
            try
            {
                _logger.LogInformation("Fetching all sectors");
                var sectors = await _service.GetAllAsync(cancellationToken);
                return Ok(sectors);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error occurred while fetching sectors");
                return StatusCode(500, new { error = "An unexpected error occurred while retrieving sectors." });
            }
        }

        [HttpGet("{id}")]
        [ProducesResponseType(typeof(SectorResponse), StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        [ProducesResponseType(StatusCodes.Status500InternalServerError)]
        public async Task<IActionResult> GetById(Guid id, CancellationToken cancellationToken)
        {
            try
            {
                _logger.LogInformation("Fetching sector with ID: {SectorId}", id);
                var sector = await _service.GetByIdAsync(id, cancellationToken);
                if (sector == null)
                {
                    _logger.LogWarning("Sector not found with ID: {SectorId}", id);
                    return NotFound("Sector not found");
                }

                return Ok(sector);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error occurred while fetching sector with ID: {SectorId}", id);
                return StatusCode(500, new { error = "An unexpected error occurred while retrieving sector." });
            }
        }

        [HttpPost]
        [ProducesResponseType(typeof(SectorResponse), StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status400BadRequest)]
        [ProducesResponseType(StatusCodes.Status500InternalServerError)]
        public async Task<IActionResult> Create([FromBody] CreateSectorRequest request, CancellationToken cancellationToken)
        {
            if (!ModelState.IsValid)
                return BadRequest(ModelState);

            try
            {
                _logger.LogInformation("Creating new sector: {Name}", request.Name);
                var created = await _service.CreateAsync(request, cancellationToken);
                return Ok(created);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error occurred while creating sector: {Name}", request.Name);
                return StatusCode(500, new { error = "An unexpected error occurred while creating sector." });
            }
        }

        [HttpPut("{id}")]
        [ProducesResponseType(typeof(SectorResponse), StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status400BadRequest)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        [ProducesResponseType(StatusCodes.Status500InternalServerError)]
        public async Task<IActionResult> Update(Guid id, [FromBody] UpdateSectorRequest request, CancellationToken cancellationToken)
        {
            if (!ModelState.IsValid)
                return BadRequest(ModelState);

            try
            {
                _logger.LogInformation("Updating sector with ID: {SectorId}", id);
                var updated = await _service.UpdateAsync(id, request, cancellationToken);
                if (updated == null)
                {
                    _logger.LogWarning("Sector not found for update: {SectorId}", id);
                    return NotFound("Sector not found");
                }

                return Ok(updated);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error occurred while updating sector with ID: {SectorId}", id);
                return StatusCode(500, new { error = "An unexpected error occurred while updating sector." });
            }
        }

        [HttpDelete("{id}")]
        [ProducesResponseType(StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        [ProducesResponseType(StatusCodes.Status500InternalServerError)]
        public async Task<IActionResult> Delete(Guid id, CancellationToken cancellationToken)
        {
            try
            {
                _logger.LogInformation("Attempting to delete sector with ID: {SectorId}", id);
                var success = await _service.DeleteAsync(id, cancellationToken);
                if (!success)
                {
                    _logger.LogWarning("Sector not found for deletion: {SectorId}", id);
                    return NotFound("Sector not found");
                }

                _logger.LogInformation("Sector deleted successfully: {SectorId}", id);
                return Ok("Sector deleted successfully");
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error occurred while deleting sector with ID: {SectorId}", id);
                return StatusCode(500, new { error = "An unexpected error occurred while deleting sector." });
            }
        }
    }
}
