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
        [Authorize]
        public async Task<IActionResult> AddQuote([FromBody] AddMotivationQuoteRequest request, CancellationToken cancellationToken)
        {
            try
            {
                if (string.IsNullOrWhiteSpace(request.Quote))
                    return BadRequest("Quote cannot be empty");

                var success = await _service.AddQuoteAsync(request, cancellationToken);
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
        [Authorize]
        public async Task<IActionResult> EditQuote([FromBody] EditMotivationQuoteRequest request, CancellationToken cancellationToken)
        {
            try
            {
                var success = await _service.EditQuoteAsync(request, cancellationToken);
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
        [Authorize]
        public async Task<IActionResult> DeleteQuote(Guid id, CancellationToken cancellationToken)
        {
            try
            {
                var success = await _service.DeleteQuoteAsync(id, cancellationToken);
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
        public async Task<IActionResult> GetAllQuotes(CancellationToken cancellationToken)
        {
            try
            {
                var quotes = await _service.GetAllQuotesAsync(cancellationToken);
                return Ok(quotes);
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
        public async Task<IActionResult> GetQuoteById(Guid id, CancellationToken cancellationToken)
        {
            try
            {
                var quote = await _service.GetQuoteByIdAsync(id, cancellationToken);
                if (quote == null)
                    return NotFound("Quote not found");

                return Ok(quote);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error retrieving motivation quote by ID");
                return StatusCode(500, new { error = "An unexpected error occurred while retrieving quote." });
            }
        }

    }
}
