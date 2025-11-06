using Microsoft.AspNetCore.Mvc;
using NiveshX.Core.DTOs;
using NiveshX.Infrastructure.Services;

namespace NiveshX.API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class AuthController : ControllerBase
    {
        private readonly AuthService _authService;
        public AuthController(AuthService authService) => _authService = authService;

        [HttpGet("ping")]
        public IActionResult Ping()
        {
            var password = BCrypt.Net.BCrypt.HashPassword("as");
            return Ok("API is alive 🚀" + password);
        }

        [HttpPost("login")]
        public async Task<IActionResult> Login(LoginRequest request)
        {
            var result = await _authService.AuthenticateAsync(request);
            if (result == null) return Unauthorized("Invalid credentials");
            return Ok(result);
        }

        

    }
}
