using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using NiveshX.API.Utils;
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
        public Task<ActionResult<IEnumerable<IndustryResponse>>> GetAll(CancellationToken cancellationToken) =>
            this.ExecuteAsync<IEnumerable<IndustryResponse>>(async () =>
            {
                _logger.LogInformation("Fetching all industries");
                var industries = await _service.GetAllAsync(cancellationToken);
                return Ok(industries);
            }, _logger, "Error occurred while fetching industries");

        [HttpGet("{id:guid}")]
        [ProducesResponseType(typeof(IndustryResponse), StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        public Task<ActionResult<IndustryResponse>> GetById(Guid id, CancellationToken cancellationToken) =>
            this.ExecuteAsync<IndustryResponse>(async () =>
            {
                _logger.LogInformation("Fetching industry with ID: {IndustryId}", id);
                var industry = await _service.GetByIdAsync(id, cancellationToken);
                return industry is not null ? Ok(industry) : NotFound(new { message = "Industry not found" });
            }, _logger, "Error occurred while fetching industry with ID: {IndustryId}", id);

        [HttpPost]
        [ProducesResponseType(typeof(IndustryResponse), StatusCodes.Status201Created)]
        [ProducesResponseType(StatusCodes.Status400BadRequest)]
        public Task<ActionResult<IndustryResponse>> Create([FromBody] CreateIndustryRequest request, CancellationToken cancellationToken)
        {
            if (!ModelState.IsValid)
                return Task.FromResult<ActionResult<IndustryResponse>>(BadRequest(ModelState));

            return this.ExecuteAsync<IndustryResponse>(async () =>
            {
                _logger.LogInformation("Creating new industry: {Name}", request.Name);
                var created = await _service.CreateAsync(request, cancellationToken);
                return CreatedAtAction(nameof(GetById), new { id = created.Id }, created);
            }, _logger, "Error occurred while creating industry: {Name}", request.Name);
        }

        [HttpPut("{id:guid}")]
        [ProducesResponseType(typeof(IndustryResponse), StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status400BadRequest)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        public Task<ActionResult<IndustryResponse>> Update(Guid id, [FromBody] UpdateIndustryRequest request, CancellationToken cancellationToken)
        {
            if (!ModelState.IsValid)
                return Task.FromResult<ActionResult<IndustryResponse>>(BadRequest(ModelState));

            return this.ExecuteAsync<IndustryResponse>(async () =>
            {
                _logger.LogInformation("Updating industry with ID: {IndustryId}", id);
                var updated = await _service.UpdateAsync(id, request, cancellationToken);
                return updated is not null ? Ok(updated) : NotFound(new { message = "Industry not found" });
            }, _logger, "Error occurred while updating industry with ID: {IndustryId}", id);
        }

        [HttpDelete("{id:guid}")]
        [ProducesResponseType(StatusCodes.Status204NoContent)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        public Task<ActionResult> Delete(Guid id, CancellationToken cancellationToken) =>
            this.ExecuteAsync(async () =>
            {
                _logger.LogInformation("Attempting to delete industry with ID: {IndustryId}", id);
                var success = await _service.DeleteAsync(id, cancellationToken);
                return success ? NoContent() : NotFound(new { message = "Industry not found" });
            }, _logger, "Error occurred while deleting industry with ID: {IndustryId}", id);
    }
}
