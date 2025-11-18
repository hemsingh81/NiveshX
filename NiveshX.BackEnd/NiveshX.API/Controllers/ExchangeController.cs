using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using NiveshX.API.Utils;
using NiveshX.Core.DTOs.Exchange;
using NiveshX.Core.Interfaces.Services;

namespace NiveshX.API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize(Roles = "Admin")]
    public class ExchangeController : ControllerBase
    {
        private readonly IExchangeService _service;
        private readonly ILogger<ExchangeController> _logger;

        public ExchangeController(IExchangeService service, ILogger<ExchangeController> logger)
        {
            _service = service;
            _logger = logger;
        }

        [HttpGet]
        [ProducesResponseType(typeof(IEnumerable<ExchangeResponse>), StatusCodes.Status200OK)]
        public Task<ActionResult<IEnumerable<ExchangeResponse>>> GetAll(CancellationToken cancellationToken) =>
            this.ExecuteAsync<IEnumerable<ExchangeResponse>>(async () =>
            {
                _logger.LogInformation("Fetching all stock markets");
                var list = await _service.GetAllAsync(cancellationToken);
                return Ok(list);
            }, _logger, "Error occurred while fetching stock markets");

        [HttpGet("{id:guid}")]
        [ProducesResponseType(typeof(ExchangeResponse), StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        public Task<ActionResult<ExchangeResponse>> GetById(Guid id, CancellationToken cancellationToken) =>
            this.ExecuteAsync<ExchangeResponse>(async () =>
            {
                _logger.LogInformation("Fetching stock market with ID: {ExchangeId}", id);
                var item = await _service.GetByIdAsync(id, cancellationToken);
                return item is not null ? Ok(item) : NotFound(new { message = "Stock market not found" });
            }, _logger, "Error occurred while fetching stock market with ID: {ExchangeId}", id);

        [HttpPost]
        [ProducesResponseType(typeof(ExchangeResponse), StatusCodes.Status201Created)]
        [ProducesResponseType(StatusCodes.Status400BadRequest)]
        public Task<ActionResult<ExchangeResponse>> Create([FromBody] CreateExchangeRequest request, CancellationToken cancellationToken)
        {
            if (!ModelState.IsValid)
                return Task.FromResult<ActionResult<ExchangeResponse>>(BadRequest(ModelState));

            return this.ExecuteAsync<ExchangeResponse>(async () =>
            {
                _logger.LogInformation("Creating new stock market: {Name}", request.Name);
                var created = await _service.CreateAsync(request, cancellationToken);
                return CreatedAtAction(nameof(GetById), new { id = created.Id }, created);
            }, _logger, "Error occurred while creating stock market: {Name}", request.Name);
        }

        [HttpPut("{id:guid}")]
        [ProducesResponseType(typeof(ExchangeResponse), StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status400BadRequest)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        public Task<ActionResult<ExchangeResponse>> Update(Guid id, [FromBody] UpdateExchangeRequest request, CancellationToken cancellationToken)
        {
            if (!ModelState.IsValid)
                return Task.FromResult<ActionResult<ExchangeResponse>>(BadRequest(ModelState));

            return this.ExecuteAsync<ExchangeResponse>(async () =>
            {
                _logger.LogInformation("Updating stock market with ID: {ExchangeId}", id);
                var updated = await _service.UpdateAsync(id, request, cancellationToken);
                return updated is not null ? Ok(updated) : NotFound(new { message = "Stock market not found" });
            }, _logger, "Error occurred while updating stock market with ID: {ExchangeId}", id);
        }

        [HttpDelete("{id:guid}")]
        [ProducesResponseType(StatusCodes.Status204NoContent)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        public Task<ActionResult> Delete(Guid id, CancellationToken cancellationToken) =>
            this.ExecuteAsync(async () =>
            {
                _logger.LogInformation("Attempting to delete stock market with ID: {ExchangeId}", id);
                var success = await _service.DeleteAsync(id, cancellationToken);
                return success ? NoContent() : NotFound(new { message = "Stock market not found" });
            }, _logger, "Error occurred while deleting stock market with ID: {ExchangeId}", id);
    }
}
