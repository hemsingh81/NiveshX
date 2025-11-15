using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using NiveshX.API.Utils;
using NiveshX.Core.DTOs.User;
using NiveshX.Core.Interfaces.Services;
using NiveshX.Core.Models;

namespace NiveshX.API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize(Roles = "Admin")]
    public class UserController : ControllerBase
    {
        private readonly IUserManagementService _userService;
        private readonly ILogger<UserController> _logger;

        public UserController(IUserManagementService userService, ILogger<UserController> logger)
        {
            _userService = userService;
            _logger = logger;
        }

        [HttpGet]
        [ProducesResponseType(typeof(IEnumerable<UserResponse>), StatusCodes.Status200OK)]
        public Task<ActionResult<IEnumerable<UserResponse>>> GetAll(CancellationToken cancellationToken) =>
            this.ExecuteAsync<IEnumerable<UserResponse>>(async () =>
            {
                _logger.LogInformation("Fetching all users");
                var users = await _userService.GetAllUsersAsync(cancellationToken);
                return Ok(users);
            }, _logger, "Error occurred while fetching all users");

        [HttpGet("{id:guid}")]
        [ProducesResponseType(typeof(UserResponse), StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        public Task<ActionResult<UserResponse>> GetById(Guid id, CancellationToken cancellationToken) =>
            this.ExecuteAsync<UserResponse>(async () =>
            {
                _logger.LogInformation("Fetching user with ID: {UserId}", id);
                var user = await _userService.GetUserByIdAsync(id, cancellationToken);
                return user is not null ? Ok(user) : NotFound(new { message = "User not found" });
            }, _logger, "Error occurred while fetching user with ID: {UserId}", id);

        [HttpPost]
        [ProducesResponseType(typeof(UserResponse), StatusCodes.Status201Created)]
        [ProducesResponseType(StatusCodes.Status400BadRequest)]
        public Task<ActionResult<UserResponse>> Create([FromBody] CreateUserRequest request, CancellationToken cancellationToken)
        {
            if (!ModelState.IsValid)
                return Task.FromResult<ActionResult<UserResponse>>(BadRequest(ModelState));

            return this.ExecuteAsync<UserResponse>(async () =>
            {
                _logger.LogInformation("Creating new user: {Email}", request.Email);
                var created = await _userService.CreateUserAsync(request, cancellationToken);
                return CreatedAtAction(nameof(GetById), new { id = created.Id }, created);
            }, _logger, "Error occurred while creating user: {Email}", request.Email);
        }

        [HttpPut("{id:guid}")]
        [ProducesResponseType(typeof(User), StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status400BadRequest)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        public Task<ActionResult<User>> Update(Guid id, [FromBody] UpdateUserRequest request, CancellationToken cancellationToken)
        {
            if (!ModelState.IsValid)
                return Task.FromResult<ActionResult<User>>(BadRequest(ModelState));

            return this.ExecuteAsync<User>(async () =>
            {
                _logger.LogInformation("Updating user with ID: {UserId}", id);
                var updated = await _userService.UpdateUserAsync(id, request, cancellationToken);
                return updated is not null ? Ok(updated) : NotFound(new { message = "User not found" });
            }, _logger, "Error occurred while updating user with ID: {UserId}", id);
        }

        [HttpDelete("{id:guid}")]
        [ProducesResponseType(StatusCodes.Status204NoContent)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        public Task<ActionResult> Delete(Guid id, CancellationToken cancellationToken) =>
            this.ExecuteAsync(async () =>
            {
                _logger.LogInformation("Deleting user with ID: {UserId}", id);
                var success = await _userService.DeleteUserAsync(id, cancellationToken);
                return success ? NoContent() : NotFound(new { message = "User not found" });
            }, _logger, "Error occurred while deleting user with ID: {UserId}", id);
    }
}
