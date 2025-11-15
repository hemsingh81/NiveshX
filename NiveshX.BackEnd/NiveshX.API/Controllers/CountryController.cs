using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using NiveshX.API.Utils;
using NiveshX.Core.DTOs.Country;
using NiveshX.Core.Interfaces.Services;

namespace NiveshX.API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize(Roles = "Admin")]
    public class CountryController : ControllerBase
    {
        private readonly ICountryService _service;
        private readonly ILogger<CountryController> _logger;

        public CountryController(ICountryService service, ILogger<CountryController> logger)
        {
            _service = service;
            _logger = logger;
        }

        [HttpGet]
        [ProducesResponseType(typeof(IEnumerable<CountryResponse>), StatusCodes.Status200OK)]
        public Task<ActionResult<IEnumerable<CountryResponse>>> GetAll(CancellationToken cancellationToken) =>
            this.ExecuteAsync<IEnumerable<CountryResponse>>(async () =>
            {
                _logger.LogInformation("Fetching all countries");
                var countries = await _service.GetAllAsync(cancellationToken);
                return Ok(countries);
            }, _logger, "Error occurred while fetching countries");

        [HttpGet("{id:guid}")]
        [ProducesResponseType(typeof(CountryResponse), StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        public Task<ActionResult<CountryResponse>> GetById(Guid id, CancellationToken cancellationToken) =>
            this.ExecuteAsync<CountryResponse>(async () =>
            {
                _logger.LogInformation("Fetching country with ID: {CountryId}", id);
                var country = await _service.GetByIdAsync(id, cancellationToken);
                return country is not null ? Ok(country) : NotFound(new { message = "Country not found" });
            }, _logger, "Error occurred while fetching country with ID: {CountryId}", id);

        [HttpPost]
        [ProducesResponseType(typeof(CountryResponse), StatusCodes.Status201Created)]
        [ProducesResponseType(StatusCodes.Status400BadRequest)]
        public Task<ActionResult<CountryResponse>> Create([FromBody] CreateCountryRequest request, CancellationToken cancellationToken)
        {
            if (!ModelState.IsValid)
                return Task.FromResult<ActionResult<CountryResponse>>(BadRequest(ModelState));

            return this.ExecuteAsync<CountryResponse>(async () =>
            {
                _logger.LogInformation("Creating new country: {Code}", request.Code);
                var created = await _service.CreateAsync(request, cancellationToken);
                return CreatedAtAction(nameof(GetById), new { id = created.Id }, created);
            }, _logger, "Error occurred while creating country: {Code}", request.Code);
        }

        [HttpPut("{id:guid}")]
        [ProducesResponseType(typeof(CountryResponse), StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status400BadRequest)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        public Task<ActionResult<CountryResponse>> Update(Guid id, [FromBody] UpdateCountryRequest request, CancellationToken cancellationToken)
        {
            if (!ModelState.IsValid)
                return Task.FromResult<ActionResult<CountryResponse>>(BadRequest(ModelState));

            return this.ExecuteAsync<CountryResponse>(async () =>
            {
                _logger.LogInformation("Updating country with ID: {CountryId}", id);
                var updated = await _service.UpdateAsync(id, request, cancellationToken);
                return updated is not null ? Ok(updated) : NotFound(new { message = "Country not found" });
            }, _logger, "Error occurred while updating country with ID: {CountryId}", id);
        }

        [HttpDelete("{id:guid}")]
        [ProducesResponseType(StatusCodes.Status204NoContent)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        public Task<ActionResult> Delete(Guid id, CancellationToken cancellationToken) =>
            this.ExecuteAsync(async () =>
            {
                _logger.LogInformation("Attempting to delete country with ID: {CountryId}", id);
                var success = await _service.DeleteAsync(id, cancellationToken);
                return success ? NoContent() : NotFound(new { message = "Country not found" });
            }, _logger, "Error occurred while deleting country with ID: {CountryId}", id);
    }
}
