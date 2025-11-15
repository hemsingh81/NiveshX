using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using NiveshX.Core.DTOs.Industry;
using NiveshX.Core.Interfaces.Services;

namespace NiveshX.API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize(Roles = "Admin")]
    public class IndustryController : ControllerBase
    {
        private readonly IIndustryService _service;
        private readonly ILogger<IndustryController> _logger;

        public IndustryController(IIndustryService service, ILogger<IndustryController> logger)
        {
            _service = service;
            _logger = logger;
        }

        [HttpGet]
        [ProducesResponseType(typeof(IEnumerable<IndustryResponse>), StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status500InternalServerError)]
        public async Task<IActionResult> GetAll(CancellationToken cancellationToken)
        {
            try
            {
                _logger.LogInformation("Fetching all industries");
                var industries = await _service.GetAllAsync(cancellationToken);
                return Ok(industries);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error occurred while fetching industries");
                return StatusCode(500, new { error = "An unexpected error occurred while retrieving industries." });
            }
        }

        [HttpGet("{id}")]
        [ProducesResponseType(typeof(IndustryResponse), StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        [ProducesResponseType(StatusCodes.Status500InternalServerError)]
        public async Task<IActionResult> GetById(Guid id, CancellationToken cancellationToken)
        {
            try
            {
                _logger.LogInformation("Fetching industry with ID: {IndustryId}", id);
                var industry = await _service.GetByIdAsync(id, cancellationToken);
                if (industry == null)
                {
                    _logger.LogWarning("Industry not found with ID: {IndustryId}", id);
                    return NotFound("Industry not found");
                }

                return Ok(industry);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error occurred while fetching industry with ID: {IndustryId}", id);
                return StatusCode(500, new { error = "An unexpected error occurred while retrieving industry." });
            }
        }

        [HttpPost]
        [ProducesResponseType(typeof(IndustryResponse), StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status400BadRequest)]
        [ProducesResponseType(StatusCodes.Status500InternalServerError)]
        public async Task<IActionResult> Create([FromBody] CreateIndustryRequest request, CancellationToken cancellationToken)
        {
            if (!ModelState.IsValid)
                return BadRequest(ModelState);

            try
            {
                _logger.LogInformation("Creating new industry: {Name}", request.Name);
                var created = await _service.CreateAsync(request, cancellationToken);
                return Ok(created);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error occurred while creating industry: {Name}", request.Name);
                return StatusCode(500, new { error = "An unexpected error occurred while creating industry." });
            }
        }

        [HttpPut("{id}")]
        [ProducesResponseType(typeof(IndustryResponse), StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status400BadRequest)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        [ProducesResponseType(StatusCodes.Status500InternalServerError)]
        public async Task<IActionResult> Update(Guid id, [FromBody] UpdateIndustryRequest request, CancellationToken cancellationToken)
        {
            if (!ModelState.IsValid)
                return BadRequest(ModelState);

            try
            {
                _logger.LogInformation("Updating industry with ID: {IndustryId}", id);
                var updated = await _service.UpdateAsync(id, request, cancellationToken);
                if (updated == null)
                {
                    _logger.LogWarning("Industry not found for update: {IndustryId}", id);
                    return NotFound("Industry not found");
                }

                return Ok(updated);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error occurred while updating industry with ID: {IndustryId}", id);
                return StatusCode(500, new { error = "An unexpected error occurred while updating industry." });
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
                _logger.LogInformation("Attempting to delete industry with ID: {IndustryId}", id);
                var success = await _service.DeleteAsync(id, cancellationToken);
                if (!success)
                {
                    _logger.LogWarning("Industry not found for deletion: {IndustryId}", id);
                    return NotFound("Industry not found");
                }

                _logger.LogInformation("Industry deleted successfully: {IndustryId}", id);
                return Ok("Industry deleted successfully");
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error occurred while deleting industry with ID: {IndustryId}", id);
                return StatusCode(500, new { error = "An unexpected error occurred while deleting industry." });
            }
        }
    }
}
