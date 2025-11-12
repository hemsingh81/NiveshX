using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using NiveshX.Core.DTOs.MotivationQuote;
using NiveshX.Core.Interfaces.Services;
using NiveshX.Core.Models;
using System.Security.Claims;

namespace NiveshX.API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize]
    public class MotivationQuoteController : ControllerBase
    {
        private readonly IMotivationQuoteService _service;
        private readonly ILogger<MotivationQuoteController> _logger;

        public MotivationQuoteController(IMotivationQuoteService service, ILogger<MotivationQuoteController> logger)
        {
            _service = service;
            _logger = logger;
        }

        [HttpPost("add")]
        [ProducesResponseType(StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status400BadRequest)]
        [ProducesResponseType(StatusCodes.Status500InternalServerError)]
        public async Task<IActionResult> Add([FromBody] AddMotivationQuoteRequest request, CancellationToken cancellationToken)
        {
            try
            {
                if (string.IsNullOrWhiteSpace(request.Quote))
                    return BadRequest("Quote cannot be empty");

                var success = await _service.AddAsync(request, cancellationToken);
                if (!success)
                    return BadRequest("Failed to add quote");

                _logger.LogInformation("Motivation quote added: {Quote}", request.Quote);
                return Ok("Quote added successfully");
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error adding motivation quote");
                return StatusCode(500, new { error = "An unexpected error occurred while adding quote." });
            }
        }

        [HttpPut("edit")]
        [ProducesResponseType(StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        [ProducesResponseType(StatusCodes.Status500InternalServerError)]
        public async Task<IActionResult> Edit([FromBody] EditMotivationQuoteRequest request, CancellationToken cancellationToken)
        {
            try
            {
                var success = await _service.EditAsync(request, cancellationToken);
                if (!success)
                {
                    _logger.LogWarning("Edit failed: Quote not found for ID {Id}", request.Id);
                    return NotFound("Quote not found");
                }

                _logger.LogInformation("Motivation quote updated: {Id}", request.Id);
                return Ok("Quote updated successfully");
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error editing motivation quote");
                return StatusCode(500, new { error = "An unexpected error occurred while editing quote." });
            }
        }

        [HttpDelete("delete/{id}")]
        [ProducesResponseType(StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        [ProducesResponseType(StatusCodes.Status500InternalServerError)]
        public async Task<IActionResult> Delete(Guid id, CancellationToken cancellationToken)
        {
            try
            {
                var success = await _service.DeleteAsync(id, cancellationToken);
                if (!success)
                {
                    _logger.LogWarning("Soft delete failed: Quote not found for ID {Id}", id);
                    return NotFound("Quote not found");
                }

                _logger.LogInformation("Motivation quote soft-deleted: {Id}", id);
                return Ok("Quote deleted successfully");
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error deleting motivation quote");
                return StatusCode(500, new { error = "An unexpected error occurred while deleting quote." });
            }
        }

        [HttpGet("all")]
        [ProducesResponseType(typeof(List<MotivationQuote>), StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status500InternalServerError)]
        public async Task<IActionResult> GetAll(CancellationToken cancellationToken)
        {
            try
            {
                var result = await _service.GetAllAsync(cancellationToken);
                return Ok(result);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error retrieving all motivation quotes");
                return StatusCode(500, new { error = "An unexpected error occurred while retrieving quotes." });
            }
        }

        [HttpGet("{id}")]
        [ProducesResponseType(typeof(MotivationQuote), StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        [ProducesResponseType(StatusCodes.Status500InternalServerError)]
        public async Task<IActionResult> GetById(Guid id, CancellationToken cancellationToken)
        {
            try
            {
                var result = await _service.GetByIdAsync(id, cancellationToken);
                if (result == null)
                    return NotFound("Quote not found");

                return Ok(result);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error retrieving motivation quote by ID");
                return StatusCode(500, new { error = "An unexpected error occurred while retrieving quote." });
            }
        }

        [HttpGet("all-active")]
        [ProducesResponseType(typeof(List<MotivationQuote>), StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status500InternalServerError)]
        [AllowAnonymous]
        public async Task<IActionResult> GetAllActive(CancellationToken cancellationToken)
        {
            try
            {
                var result = await _service.GetAllActive(cancellationToken);
                return Ok(result);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error retrieving all motivation quotes");
                return StatusCode(500, new { error = "An unexpected error occurred while retrieving quotes." });
            }
        }

    }
}
