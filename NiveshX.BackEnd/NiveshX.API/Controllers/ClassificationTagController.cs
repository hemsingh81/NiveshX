using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using NiveshX.Core.DTOs.ClassificationTag;
using NiveshX.Core.Interfaces.Services;

namespace NiveshX.API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize(Roles = "Admin")]
    public class ClassificationTagController : ControllerBase
    {
        private readonly IClassificationTagService _service;
        private readonly ILogger<ClassificationTagController> _logger;

        public ClassificationTagController(IClassificationTagService service, ILogger<ClassificationTagController> logger)
        {
            _service = service;
            _logger = logger;
        }

        [HttpGet]
        [ProducesResponseType(typeof(IEnumerable<ClassificationTagResponse>), StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status500InternalServerError)]
        public async Task<IActionResult> GetAll(CancellationToken cancellationToken)
        {
            try
            {
                _logger.LogInformation("Fetching all classification tags");
                var tags = await _service.GetAllAsync(cancellationToken);
                return Ok(tags);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error occurred while fetching classification tags");
                return StatusCode(500, new { error = "An unexpected error occurred while retrieving classification tags." });
            }
        }

        [HttpGet("{id}")]
        [ProducesResponseType(typeof(ClassificationTagResponse), StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        [ProducesResponseType(StatusCodes.Status500InternalServerError)]
        public async Task<IActionResult> GetById(Guid id, CancellationToken cancellationToken)
        {
            try
            {
                _logger.LogInformation("Fetching classification tag with ID: {TagId}", id);
                var tag = await _service.GetByIdAsync(id, cancellationToken);
                if (tag == null)
                {
                    _logger.LogWarning("Classification tag not found with ID: {TagId}", id);
                    return NotFound("Classification tag not found");
                }

                return Ok(tag);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error occurred while fetching classification tag with ID: {TagId}", id);
                return StatusCode(500, new { error = "An unexpected error occurred while retrieving classification tag." });
            }
        }

        [HttpPost]
        [ProducesResponseType(typeof(ClassificationTagResponse), StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status400BadRequest)]
        [ProducesResponseType(StatusCodes.Status500InternalServerError)]
        public async Task<IActionResult> Create([FromBody] CreateClassificationTagRequest request, CancellationToken cancellationToken)
        {
            if (!ModelState.IsValid)
                return BadRequest(ModelState);

            try
            {
                _logger.LogInformation("Creating new classification tag: {Name}", request.Name);
                var created = await _service.CreateAsync(request, cancellationToken);
                return Ok(created);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error occurred while creating classification tag: {Name}", request.Name);
                return StatusCode(500, new { error = "An unexpected error occurred while creating classification tag." });
            }
        }

        [HttpPut("{id}")]
        [ProducesResponseType(typeof(ClassificationTagResponse), StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status400BadRequest)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        [ProducesResponseType(StatusCodes.Status500InternalServerError)]
        public async Task<IActionResult> Update(Guid id, [FromBody] UpdateClassificationTagRequest request, CancellationToken cancellationToken)
        {
            if (!ModelState.IsValid)
                return BadRequest(ModelState);

            try
            {
                _logger.LogInformation("Updating classification tag with ID: {TagId}", id);
                var updated = await _service.UpdateAsync(id, request, cancellationToken);
                if (updated == null)
                {
                    _logger.LogWarning("Classification tag not found for update: {TagId}", id);
                    return NotFound("Classification tag not found");
                }

                return Ok(updated);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error occurred while updating classification tag with ID: {TagId}", id);
                return StatusCode(500, new { error = "An unexpected error occurred while updating classification tag." });
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
                _logger.LogInformation("Attempting to delete classification tag with ID: {TagId}", id);
                var success = await _service.DeleteAsync(id, cancellationToken);
                if (!success)
                {
                    _logger.LogWarning("Classification tag not found for deletion: {TagId}", id);
                    return NotFound("Classification tag not found");
                }

                _logger.LogInformation("Classification tag deleted successfully: {TagId}", id);
                return Ok("Classification tag deleted successfully");
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error occurred while deleting classification tag with ID: {TagId}", id);
                return StatusCode(500, new { error = "An unexpected error occurred while deleting classification tag." });
            }
        }
    }
}
