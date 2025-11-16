using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using NiveshX.API.Utils;
using NiveshX.Core.DTOs.MotivationQuote;
using NiveshX.Core.Interfaces.Services;

namespace NiveshX.API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize(Roles = "Admin")]
    public class MotivationQuoteController : ControllerBase
    {
        private readonly IMotivationQuoteService _service;
        private readonly ILogger<MotivationQuoteController> _logger;

        public MotivationQuoteController(IMotivationQuoteService service, ILogger<MotivationQuoteController> logger)
        {
            _service = service;
            _logger = logger;
        }

        [HttpGet]
        [ProducesResponseType(typeof(IEnumerable<MotivationQuoteResponse>), StatusCodes.Status200OK)]
        public Task<ActionResult<IEnumerable<MotivationQuoteResponse>>> GetAll(CancellationToken cancellationToken) =>
            this.ExecuteAsync<IEnumerable<MotivationQuoteResponse>>(async () =>
            {
                _logger.LogInformation("Fetching all motivation quotes");
                var quotes = await _service.GetAllAsync(cancellationToken);
                return Ok(quotes);
            }, _logger, "Error occurred while fetching motivation quotes");

        [HttpGet("all-active")]
        [ProducesResponseType(typeof(IEnumerable<MotivationQuoteResponse>), StatusCodes.Status200OK)]
        [AllowAnonymous]
        public Task<ActionResult<IEnumerable<MotivationQuoteResponse>>> GetAllActive(CancellationToken cancellationToken) =>
            this.ExecuteAsync<IEnumerable<MotivationQuoteResponse>>(async () =>
            {
                _logger.LogInformation("Fetching all Active motivation quotes");
                var quotes = await _service.GetAllActiveAsync(cancellationToken);
                return Ok(quotes);
            }, _logger, "Error occurred while fetching active motivation quotes");

        [HttpGet("{id:guid}")]
        [ProducesResponseType(typeof(MotivationQuoteResponse), StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        public Task<ActionResult<MotivationQuoteResponse>> GetById(Guid id, CancellationToken cancellationToken) =>
            this.ExecuteAsync<MotivationQuoteResponse>(async () =>
            {
                _logger.LogInformation("Fetching motivation quote with ID: {QuoteId}", id);
                var quote = await _service.GetByIdAsync(id, cancellationToken);
                return quote is not null ? Ok(quote) : NotFound(new { message = "Motivation quote not found" });
            }, _logger, "Error occurred while fetching motivation quote with ID: {QuoteId}", id);

        [HttpPost]
        [ProducesResponseType(typeof(MotivationQuoteResponse), StatusCodes.Status201Created)]
        [ProducesResponseType(StatusCodes.Status400BadRequest)]
        public Task<ActionResult<MotivationQuoteResponse>> Create([FromBody] CreateMotivationQuoteRequest request, CancellationToken cancellationToken)
        {
            if (!ModelState.IsValid)
                return Task.FromResult<ActionResult<MotivationQuoteResponse>>(BadRequest(ModelState));

            return this.ExecuteAsync<MotivationQuoteResponse>(async () =>
            {
                _logger.LogInformation("Creating new motivation quote by author: {Author}", request.Author);
                var created = await _service.CreateAsync(request, cancellationToken);
                return CreatedAtAction(nameof(GetById), new { id = created.Id }, created);
            }, _logger, "Error occurred while creating motivation quote by author: {Author}", request.Author);
        }

        [HttpPut("{id:guid}")]
        [ProducesResponseType(typeof(MotivationQuoteResponse), StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status400BadRequest)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        public Task<ActionResult<MotivationQuoteResponse>> Update(Guid id, [FromBody] UpdateMotivationQuoteRequest request, CancellationToken cancellationToken)
        {
            if (!ModelState.IsValid)
                return Task.FromResult<ActionResult<MotivationQuoteResponse>>(BadRequest(ModelState));

            return this.ExecuteAsync<MotivationQuoteResponse>(async () =>
            {
                _logger.LogInformation("Updating motivation quote with ID: {QuoteId}", id);
                var updated = await _service.UpdateAsync(id, request, cancellationToken);
                return updated is not null ? Ok(updated) : NotFound(new { message = "Motivation quote not found" });
            }, _logger, "Error occurred while updating motivation quote with ID: {QuoteId}", id);
        }

        [HttpDelete("{id:guid}")]
        [ProducesResponseType(StatusCodes.Status204NoContent)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        public Task<ActionResult> Delete(Guid id, CancellationToken cancellationToken) =>
            this.ExecuteAsync(async () =>
            {
                _logger.LogInformation("Attempting to delete motivation quote with ID: {QuoteId}", id);
                var success = await _service.DeleteAsync(id, cancellationToken);
                return success ? NoContent() : NotFound(new { message = "Motivation quote not found" });
            }, _logger, "Error occurred while deleting motivation quote with ID: {QuoteId}", id);
    }
}
