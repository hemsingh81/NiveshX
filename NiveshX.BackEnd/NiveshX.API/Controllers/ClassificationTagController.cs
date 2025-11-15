using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using NiveshX.API.Utils;
using NiveshX.Core.DTOs.ClassificationTag;
using NiveshX.Core.Interfaces.Services;

namespace NiveshX.API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize(Roles = "Admin")]
    public class ClassificationTagController : ControllerBase
    {
        private readonly IClassificationTagService _service;
        private readonly ILogger<ClassificationTagController> _logger;

        public ClassificationTagController(IClassificationTagService service, ILogger<ClassificationTagController> logger)
        {
            _service = service;
            _logger = logger;
        }

        [HttpGet]
        [ProducesResponseType(typeof(IEnumerable<ClassificationTagResponse>), StatusCodes.Status200OK)]
        public Task<ActionResult<IEnumerable<ClassificationTagResponse>>> GetAll(CancellationToken cancellationToken) =>
            this.ExecuteAsync<IEnumerable<ClassificationTagResponse>>(async () =>
            {
                _logger.LogInformation("Fetching all classification tags");
                var tags = await _service.GetAllAsync(cancellationToken);
                return Ok(tags);
            }, _logger, "Error occurred while fetching classification tags");

        [HttpGet("{id:guid}")]
        [ProducesResponseType(typeof(ClassificationTagResponse), StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        public Task<ActionResult<ClassificationTagResponse>> GetById(Guid id, CancellationToken cancellationToken) =>
            this.ExecuteAsync<ClassificationTagResponse>(async () =>
            {
                _logger.LogInformation("Fetching classification tag with ID: {TagId}", id);
                var tag = await _service.GetByIdAsync(id, cancellationToken);
                return tag is not null ? Ok(tag) : NotFound(new { message = "Classification tag not found" });
            }, _logger, "Error occurred while fetching classification tag with ID: {TagId}", id);

        [HttpPost]
        [ProducesResponseType(typeof(ClassificationTagResponse), StatusCodes.Status201Created)]
        [ProducesResponseType(StatusCodes.Status400BadRequest)]
        public Task<ActionResult<ClassificationTagResponse>> Create([FromBody] CreateClassificationTagRequest request, CancellationToken cancellationToken)
        {
            if (!ModelState.IsValid)
                return Task.FromResult<ActionResult<ClassificationTagResponse>>(BadRequest(ModelState));

            return this.ExecuteAsync<ClassificationTagResponse>(async () =>
            {
                _logger.LogInformation("Creating new classification tag: {Name}", request.Name);
                var created = await _service.CreateAsync(request, cancellationToken);
                return CreatedAtAction(nameof(GetById), new { id = created.Id }, created);
            }, _logger, "Error occurred while creating classification tag: {Name}", request.Name);
        }

        [HttpPut("{id:guid}")]
        [ProducesResponseType(typeof(ClassificationTagResponse), StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status400BadRequest)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        public Task<ActionResult<ClassificationTagResponse>> Update(Guid id, [FromBody] UpdateClassificationTagRequest request, CancellationToken cancellationToken)
        {
            if (!ModelState.IsValid)
                return Task.FromResult<ActionResult<ClassificationTagResponse>>(BadRequest(ModelState));

            return this.ExecuteAsync<ClassificationTagResponse>(async () =>
            {
                _logger.LogInformation("Updating classification tag with ID: {TagId}", id);
                var updated = await _service.UpdateAsync(id, request, cancellationToken);
                return updated is not null ? Ok(updated) : NotFound(new { message = "Classification tag not found" });
            }, _logger, "Error occurred while updating classification tag with ID: {TagId}", id);
        }

        [HttpDelete("{id:guid}")]
        [ProducesResponseType(StatusCodes.Status204NoContent)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        public Task<ActionResult> Delete(Guid id, CancellationToken cancellationToken) =>
            this.ExecuteAsync(async () =>
            {
                _logger.LogInformation("Attempting to delete classification tag with ID: {TagId}", id);
                var success = await _service.DeleteAsync(id, cancellationToken);
                return success ? NoContent() : NotFound(new { message = "Classification tag not found" });
            }, _logger, "Error occurred while deleting classification tag with ID: {TagId}", id);
    }
}
