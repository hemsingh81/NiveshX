using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using NiveshX.API.Utils;
using NiveshX.Core.DTOs;
using NiveshX.Core.Interfaces.Services;

namespace NiveshX.API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize(Roles = "Admin")]
    public class MarketCalendarController : ControllerBase
    {
        private readonly IMarketCalendarService _service;
        private readonly ILogger<MarketCalendarController> _logger;

        public MarketCalendarController(IMarketCalendarService service, ILogger<MarketCalendarController> logger)
        {
            _service = service;
            _logger = logger;
        }

        // GET api/marketcalendar
        [HttpGet]
        [ProducesResponseType(typeof(IEnumerable<MarketCalendarResponse>), StatusCodes.Status200OK)]
        public Task<ActionResult<IEnumerable<MarketCalendarResponse>>> GetAll(CancellationToken cancellationToken) =>
            this.ExecuteAsync<IEnumerable<MarketCalendarResponse>>(async () =>
            {
                _logger.LogInformation("Fetching all market calendars");
                var list = await _service.GetAllAsync(cancellationToken);
                return Ok(list);
            }, _logger, "Error occurred while fetching all market calendars");

        // GET api/marketcalendar/exchange/{exchangeId}
        [HttpGet("exchange/{exchangeId:guid}")]
        [ProducesResponseType(typeof(IEnumerable<MarketCalendarResponse>), StatusCodes.Status200OK)]
        public Task<ActionResult<IEnumerable<MarketCalendarResponse>>> GetByExchange(Guid exchangeId, CancellationToken cancellationToken) =>
            this.ExecuteAsync<IEnumerable<MarketCalendarResponse>>(async () =>
            {
                _logger.LogInformation("Fetching market calendars for ExchangeId: {ExchangeId}", exchangeId);
                var list = await _service.GetAllByExchangeAsync(exchangeId, cancellationToken);
                return Ok(list);
            }, _logger, "Error occurred while fetching market calendars for ExchangeId: {ExchangeId}", exchangeId);

        // Admin: GET api/marketcalendar/admin/all-including-deleted
        [HttpGet("admin/all-including-deleted")]
        [ProducesResponseType(typeof(IEnumerable<MarketCalendarResponse>), StatusCodes.Status200OK)]
        public Task<ActionResult<IEnumerable<MarketCalendarResponse>>> GetAllIncludingDeleted(CancellationToken cancellationToken) =>
            this.ExecuteAsync<IEnumerable<MarketCalendarResponse>>(async () =>
            {
                _logger.LogInformation("Fetching all market calendars including deleted (admin)");
                var list = await _service.GetAllIncludingDeletedAsync(cancellationToken);
                return Ok(list);
            }, _logger, "Error occurred while fetching all market calendars including deleted");

        // GET api/marketcalendar/{id}
        [HttpGet("{id:guid}")]
        [ProducesResponseType(typeof(MarketCalendarResponse), StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        public Task<ActionResult<MarketCalendarResponse>> GetById(Guid id, CancellationToken cancellationToken) =>
            this.ExecuteAsync<MarketCalendarResponse>(async () =>
            {
                _logger.LogInformation("Fetching market calendar with ID: {MarketCalendarId}", id);
                var item = await _service.GetByIdAsync(id, cancellationToken);
                return item is not null ? Ok(item) : NotFound(new { message = "Market calendar not found" });
            }, _logger, "Error occurred while fetching market calendar with ID: {MarketCalendarId}", id);

        // POST api/marketcalendar
        [HttpPost]
        [ProducesResponseType(typeof(MarketCalendarResponse), StatusCodes.Status201Created)]
        [ProducesResponseType(StatusCodes.Status400BadRequest)]
        [ProducesResponseType(StatusCodes.Status409Conflict)]
        public Task<ActionResult<MarketCalendarResponse>> Create([FromBody] CreateMarketCalendarRequest request, CancellationToken cancellationToken)
        {
            if (!ModelState.IsValid)
                return Task.FromResult<ActionResult<MarketCalendarResponse>>(BadRequest(ModelState));

            return this.ExecuteAsync<MarketCalendarResponse>(async () =>
            {
                _logger.LogInformation("Creating market calendar for ExchangeId: {ExchangeId}", request.ExchangeId);
                var created = await _service.CreateAsync(request, cancellationToken);
                return CreatedAtAction(nameof(GetById), new { id = created.Id }, created);
            }, _logger, "Error occurred while creating market calendar for ExchangeId: {ExchangeId}", request.ExchangeId);
        }

        // PUT api/marketcalendar/{id}
        [HttpPut("{id:guid}")]
        [ProducesResponseType(typeof(MarketCalendarResponse), StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status400BadRequest)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        [ProducesResponseType(StatusCodes.Status409Conflict)]
        public Task<ActionResult<MarketCalendarResponse>> Update(Guid id, [FromBody] UpdateMarketCalendarRequest request, CancellationToken cancellationToken)
        {
            if (!ModelState.IsValid)
                return Task.FromResult<ActionResult<MarketCalendarResponse>>(BadRequest(ModelState));

            return this.ExecuteAsync<MarketCalendarResponse>(async () =>
            {
                _logger.LogInformation("Updating market calendar with ID: {MarketCalendarId}", id);
                var updated = await _service.UpdateAsync(id, request, cancellationToken);
                return updated is not null ? Ok(updated) : NotFound(new { message = "Market calendar not found" });
            }, _logger, "Error occurred while updating market calendar with ID: {MarketCalendarId}", id);
        }

        // DELETE api/marketcalendar/{id}
        [HttpDelete("{id:guid}")]
        [ProducesResponseType(StatusCodes.Status204NoContent)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        public Task<ActionResult> Delete(Guid id, CancellationToken cancellationToken) =>
            this.ExecuteAsync(async () =>
            {
                _logger.LogInformation("Attempting to delete market calendar with ID: {MarketCalendarId}", id);
                var success = await _service.DeleteAsync(id, cancellationToken);
                return success ? NoContent() : NotFound(new { message = "Market calendar not found" });
            }, _logger, "Error occurred while deleting market calendar with ID: {MarketCalendarId}", id);
    }
}
