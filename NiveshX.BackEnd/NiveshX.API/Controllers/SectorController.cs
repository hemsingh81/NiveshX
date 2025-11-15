using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using NiveshX.API.Utils;
using NiveshX.Core.DTOs.Sector;
using NiveshX.Core.Interfaces.Services;

namespace NiveshX.API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize(Roles = "Admin")]
    public class SectorController : ControllerBase
    {
        private readonly ISectorService _service;
        private readonly ILogger<SectorController> _logger;

        public SectorController(ISectorService service, ILogger<SectorController> logger)
        {
            _service = service;
            _logger = logger;
        }

        [HttpGet]
        [ProducesResponseType(typeof(IEnumerable<SectorResponse>), StatusCodes.Status200OK)]
        public Task<ActionResult<IEnumerable<SectorResponse>>> GetAll(CancellationToken cancellationToken) =>
            this.ExecuteAsync<IEnumerable<SectorResponse>>(async () =>
            {
                _logger.LogInformation("Fetching all sectors");
                var sectors = await _service.GetAllAsync(cancellationToken);
                return Ok(sectors);
            }, _logger, "Error occurred while fetching sectors");

        [HttpGet("{id:guid}")]
        [ProducesResponseType(typeof(SectorResponse), StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        public Task<ActionResult<SectorResponse>> GetById(Guid id, CancellationToken cancellationToken) =>
            this.ExecuteAsync<SectorResponse>(async () =>
            {
                _logger.LogInformation("Fetching sector with ID: {SectorId}", id);
                var sector = await _service.GetByIdAsync(id, cancellationToken);
                return sector is not null ? Ok(sector) : NotFound(new { message = "Sector not found" });
            }, _logger, "Error occurred while fetching sector with ID: {SectorId}", id);

        [HttpPost]
        [ProducesResponseType(typeof(SectorResponse), StatusCodes.Status201Created)]
        [ProducesResponseType(StatusCodes.Status400BadRequest)]
        public Task<ActionResult<SectorResponse>> Create([FromBody] CreateSectorRequest request, CancellationToken cancellationToken)
        {
            if (!ModelState.IsValid)
                return Task.FromResult<ActionResult<SectorResponse>>(BadRequest(ModelState));

            return this.ExecuteAsync<SectorResponse>(async () =>
            {
                _logger.LogInformation("Creating new sector: {Name}", request.Name);
                var created = await _service.CreateAsync(request, cancellationToken);
                return CreatedAtAction(nameof(GetById), new { id = created.Id }, created);
            }, _logger, "Error occurred while creating sector: {Name}", request.Name);
        }

        [HttpPut("{id:guid}")]
        [ProducesResponseType(typeof(SectorResponse), StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status400BadRequest)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        public Task<ActionResult<SectorResponse>> Update(Guid id, [FromBody] UpdateSectorRequest request, CancellationToken cancellationToken)
        {
            if (!ModelState.IsValid)
                return Task.FromResult<ActionResult<SectorResponse>>(BadRequest(ModelState));

            return this.ExecuteAsync<SectorResponse>(async () =>
            {
                _logger.LogInformation("Updating sector with ID: {SectorId}", id);
                var updated = await _service.UpdateAsync(id, request, cancellationToken);
                return updated is not null ? Ok(updated) : NotFound(new { message = "Sector not found" });
            }, _logger, "Error occurred while updating sector with ID: {SectorId}", id);
        }

        [HttpDelete("{id:guid}")]
        [ProducesResponseType(StatusCodes.Status204NoContent)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        public Task<ActionResult> Delete(Guid id, CancellationToken cancellationToken) =>
            this.ExecuteAsync(async () =>
            {
                _logger.LogInformation("Attempting to delete sector with ID: {SectorId}", id);
                var success = await _service.DeleteAsync(id, cancellationToken);
                return success ? NoContent() : NotFound(new { message = "Sector not found" });
            }, _logger, "Error occurred while deleting sector with ID: {SectorId}", id);
    }
}
