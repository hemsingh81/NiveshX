using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
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
        [ProducesResponseType(StatusCodes.Status500InternalServerError)]
        public async Task<IActionResult> GetAll(CancellationToken cancellationToken)
        {
            try
            {
                _logger.LogInformation("Fetching all countries");
                var countries = await _service.GetAllAsync(cancellationToken);
                return Ok(countries);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error occurred while fetching countries");
                return StatusCode(500, new { error = "An unexpected error occurred while retrieving countries." });
            }
        }

        [HttpGet("{id}")]
        [ProducesResponseType(typeof(CountryResponse), StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        [ProducesResponseType(StatusCodes.Status500InternalServerError)]
        public async Task<IActionResult> GetById(Guid id, CancellationToken cancellationToken)
        {
            try
            {
                _logger.LogInformation("Fetching country with ID: {CountryId}", id);
                var country = await _service.GetByIdAsync(id, cancellationToken);
                if (country == null)
                {
                    _logger.LogWarning("Country not found with ID: {CountryId}", id);
                    return NotFound("Country not found");
                }

                return Ok(country);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error occurred while fetching country with ID: {CountryId}", id);
                return StatusCode(500, new { error = "An unexpected error occurred while retrieving country." });
            }
        }

        [HttpPost]
        [ProducesResponseType(typeof(CountryResponse), StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status400BadRequest)]
        [ProducesResponseType(StatusCodes.Status500InternalServerError)]
        public async Task<IActionResult> Create([FromBody] CreateCountryRequest request, CancellationToken cancellationToken)
        {
            if (!ModelState.IsValid)
                return BadRequest(ModelState);

            try
            {
                _logger.LogInformation("Creating new country: {Code}", request.Code);
                var created = await _service.CreateAsync(request, cancellationToken);
                return Ok(created);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error occurred while creating country: {Code}", request.Code);
                return StatusCode(500, new { error = "An unexpected error occurred while creating country." });
            }
        }

        [HttpPut("{id}")]
        [ProducesResponseType(typeof(CountryResponse), StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status400BadRequest)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        [ProducesResponseType(StatusCodes.Status500InternalServerError)]
        public async Task<IActionResult> Update(Guid id, [FromBody] UpdateCountryRequest request, CancellationToken cancellationToken)
        {
            if (!ModelState.IsValid)
                return BadRequest(ModelState);

            try
            {
                _logger.LogInformation("Updating country with ID: {CountryId}", id);
                var updated = await _service.UpdateAsync(id, request, cancellationToken);
                if (updated == null)
                {
                    _logger.LogWarning("Country not found for update: {CountryId}", id);
                    return NotFound("Country not found");
                }

                return Ok(updated);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error occurred while updating country with ID: {CountryId}", id);
                return StatusCode(500, new { error = "An unexpected error occurred while updating country." });
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
                _logger.LogInformation("Attempting to delete country with ID: {CountryId}", id);
                var success = await _service.DeleteAsync(id, cancellationToken);
                if (!success)
                {
                    _logger.LogWarning("Country not found for deletion: {CountryId}", id);
                    return NotFound("Country not found");
                }

                _logger.LogInformation("Country deleted successfully: {CountryId}", id);
                return Ok("Country deleted successfully");
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error occurred while deleting country with ID: {CountryId}", id);
                return StatusCode(500, new { error = "An unexpected error occurred while deleting country." });
            }
        }
    }

}
