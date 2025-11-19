using Microsoft.AspNetCore.Http;
using Microsoft.Extensions.Logging;
using NiveshX.Core.Exceptions;
using System.ComponentModel.DataAnnotations;
using System.Net;
using System.Text.Json;

namespace NiveshX.API.Middlewares
{
    public class ExceptionMiddleware
    {
        private readonly RequestDelegate _next;
        private readonly ILogger<ExceptionMiddleware> _logger;

        public ExceptionMiddleware(RequestDelegate next, ILogger<ExceptionMiddleware> logger)
        {
            _next = next;
            _logger = logger;
        }

        public async Task InvokeAsync(HttpContext context)
        {
            try
            {
                await _next(context);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Unhandled exception occurred while processing {Method} {Path}", context.Request.Method, context.Request.Path);
                await HandleExceptionAsync(context, ex);
            }
        }

        private static Task HandleExceptionAsync(HttpContext context, Exception exception)
        {
            var statusCode = HttpStatusCode.InternalServerError;
            object payload;

            switch (exception)
            {
                case NotFoundException nf:
                    statusCode = HttpStatusCode.NotFound;
                    payload = new { error = nf.Message, type = nameof(NotFoundException) };
                    break;

                case DuplicateEntityException de:
                    statusCode = HttpStatusCode.Conflict;
                    payload = new { error = de.Message, type = nameof(DuplicateEntityException) };
                    break;

                case ConcurrencyException ce:
                    statusCode = HttpStatusCode.Conflict;
                    payload = new { error = ce.Message, type = nameof(ConcurrencyException) };
                    break;

                case ValidationException ve:
                    statusCode = HttpStatusCode.BadRequest;
                    payload = new { error = ve.Message, type = nameof(ValidationException) };
                    break;

                case UnauthorizedAccessException _:
                    statusCode = HttpStatusCode.Forbidden;
                    payload = new { error = "Forbidden", type = nameof(UnauthorizedAccessException) };
                    break;

                case OperationCanceledException _:
                    // client disconnected or request cancelled
                    statusCode = (HttpStatusCode)499; // Client Closed Request
                    payload = new { error = "Request cancelled", type = nameof(OperationCanceledException) };
                    break;

                default:
                    statusCode = HttpStatusCode.InternalServerError;
                    payload = new { error = "An unexpected error occurred.", type = exception.GetType().Name };
                    break;
            }

            context.Response.ContentType = "application/json";
            context.Response.StatusCode = (int)statusCode;
            var json = JsonSerializer.Serialize(payload);
            return context.Response.WriteAsync(json);
        }
    }
    
}
