using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using NiveshX.API.Utils;
using NiveshX.Core.DTOs.MotivationQuote;
using NiveshX.Core.Interfaces.Services;
using NiveshX.Core.Models;

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
        public Task<ActionResult> Add([FromBody] AddMotivationQuoteRequest request, CancellationToken cancellationToken)
        {
            if (!ModelState.IsValid)
                return Task.FromResult<ActionResult>(BadRequest(ModelState));

            return this.ExecuteAsync(async () =>
            {
                if (string.IsNullOrWhiteSpace(request.Quote))
                    return BadRequest("Quote cannot be empty");

                var success = await _service.AddAsync(request, cancellationToken);
                if (!success)
                    return BadRequest("Failed to add quote");

                _logger.LogInformation("Motivation quote added: {Quote}", request.Quote);
                return Ok("Quote added successfully");
            }, _logger, "Error adding motivation quote");
        }

        [HttpPut("edit")]
        [ProducesResponseType(StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        [ProducesResponseType(StatusCodes.Status400BadRequest)]
        public Task<ActionResult> Edit([FromBody] EditMotivationQuoteRequest request, CancellationToken cancellationToken)
        {
            if (!ModelState.IsValid)
                return Task.FromResult<ActionResult>(BadRequest(ModelState));

            return this.ExecuteAsync(async () =>
            {
                var success = await _service.EditAsync(request, cancellationToken);
                if (!success)
                {
                    _logger.LogWarning("Edit failed: Quote not found for ID {Id}", request.Id);
                    return NotFound("Quote not found");
                }

                _logger.LogInformation("Motivation quote updated: {Id}", request.Id);
                return Ok("Quote updated successfully");
            }, _logger, "Error editing motivation quote with ID: {Id}", request.Id);
        }

        [HttpDelete("delete/{id:guid}")]
        [ProducesResponseType(StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        public Task<ActionResult> Delete(Guid id, CancellationToken cancellationToken) =>
            this.ExecuteAsync(async () =>
            {
                var success = await _service.DeleteAsync(id, cancellationToken);
                if (!success)
                {
                    _logger.LogWarning("Soft delete failed: Quote not found for ID {Id}", id);
                    return NotFound("Quote not found");
                }

                _logger.LogInformation("Motivation quote soft-deleted: {Id}", id);
                return Ok("Quote deleted successfully");
            }, _logger, "Error deleting motivation quote with ID: {Id}", id);

        [HttpGet("all")]
        [ProducesResponseType(typeof(List<MotivationQuote>), StatusCodes.Status200OK)]
        public Task<ActionResult<List<MotivationQuote>>> GetAll(CancellationToken cancellationToken) =>
            this.ExecuteAsync<List<MotivationQuote>>(async () =>
            {
                var result = await _service.GetAllAsync(cancellationToken);
                return Ok(result);
            }, _logger, "Error retrieving all motivation quotes");

        [HttpGet("{id:guid}")]
        [ProducesResponseType(typeof(MotivationQuote), StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        public Task<ActionResult<MotivationQuote>> GetById(Guid id, CancellationToken cancellationToken) =>
            this.ExecuteAsync<MotivationQuote>(async () =>
            {
                var result = await _service.GetByIdAsync(id, cancellationToken);
                return result is not null ? Ok(result) : NotFound("Quote not found");
            }, _logger, "Error retrieving motivation quote by ID: {Id}", id);

        [HttpGet("all-active")]
        [ProducesResponseType(typeof(List<MotivationQuote>), StatusCodes.Status200OK)]
        [AllowAnonymous]
        public Task<ActionResult<List<MotivationQuote>>> GetAllActive(CancellationToken cancellationToken) =>
            this.ExecuteAsync<List<MotivationQuote>>(async () =>
            {
                var result = await _service.GetAllActive(cancellationToken);
                return Ok(result);
            }, _logger, "Error retrieving all active motivation quotes");
    }
}
