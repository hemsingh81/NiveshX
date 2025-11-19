using Microsoft.AspNetCore.Mvc;
using NiveshX.Core.Exceptions;
using System.ComponentModel.DataAnnotations;

namespace NiveshX.API.Utils
{
    public static class ControllerExtensions
    {
        public static async Task<ActionResult> ExecuteAsync(
            this ControllerBase controller,
            Func<Task<IActionResult>> work,
            ILogger logger,
            string errorMessage,
            params object[] args)
        {
            try
            {
                var result = await work().ConfigureAwait(false);
                return (ActionResult)result;
            }
            catch (OperationCanceledException)
            {
                logger.LogInformation("Request cancelled");
                return controller.StatusCode(StatusCodes.Status499ClientClosedRequest);
            }
            catch (ArgumentException argEx)
            {
                logger.LogWarning(argEx, "Validation error: {Message}", argEx.Message);
                var pd = new ProblemDetails
                {
                    Title = "Invalid request",
                    Detail = argEx.Message,
                    Status = StatusCodes.Status400BadRequest
                };
                return controller.BadRequest(pd);
            }
            catch (InvalidOperationException invOpEx)
            {
                logger.LogWarning(invOpEx, "Invalid operation: {Message}", invOpEx.Message);
                var pd = new ProblemDetails
                {
                    Title = "Invalid request",
                    Detail = invOpEx.Message,
                    Status = StatusCodes.Status400BadRequest
                };
                return controller.BadRequest(pd);
            }
            catch (NotFoundException nfEx)
            {
                logger.LogWarning(nfEx, "Not found: {Message}", nfEx.Message);
                var pd = new ProblemDetails
                {
                    Title = "Not found",
                    Detail = nfEx.Message,
                    Status = StatusCodes.Status404NotFound
                };
                return controller.NotFound(pd);
            }
            catch (DuplicateEntityException dupEx)
            {
                logger.LogWarning(dupEx, "Conflict: {Message}", dupEx.Message);
                var pd = new ProblemDetails
                {
                    Title = "Conflict",
                    Detail = dupEx.Message,
                    Status = StatusCodes.Status409Conflict
                };
                return controller.Conflict(pd);
            }
            catch (ConcurrencyException concEx)
            {
                logger.LogWarning(concEx, "Concurrency conflict: {Message}", concEx.Message);
                var pd = new ProblemDetails
                {
                    Title = "Conflict",
                    Detail = concEx.Message,
                    Status = StatusCodes.Status409Conflict
                };
                return controller.Conflict(pd);
            }
            catch (ValidationException valEx)
            {
                logger.LogWarning(valEx, "Validation failed: {Message}", valEx.Message);
                var pd = new ProblemDetails
                {
                    Title = "Validation failed",
                    Detail = valEx.Message,
                    Status = StatusCodes.Status400BadRequest
                };
                return controller.BadRequest(pd);
            }
            catch (UnauthorizedAccessException uaEx)
            {
                logger.LogWarning(uaEx, "Unauthorized access: {Message}", uaEx.Message);
                return controller.Forbid();
            }
            catch (Exception ex)
            {
                if (args?.Length > 0)
                    logger.LogError(ex, errorMessage, args);
                else
                    logger.LogError(ex, errorMessage);

                var pd = new ProblemDetails
                {
                    Title = "An unexpected error occurred",
                    Detail = "An unexpected error occurred while processing your request.",
                    Status = StatusCodes.Status500InternalServerError
                };

                return controller.StatusCode(StatusCodes.Status500InternalServerError, pd);
            }
        }

        public static async Task<ActionResult<T>> ExecuteAsync<T>(
            this ControllerBase controller,
            Func<Task<ActionResult<T>>> work,
            ILogger logger,
            string errorMessage,
            params object[] args)
        {
            try
            {
                var result = await work().ConfigureAwait(false);
                return result;
            }
            catch (OperationCanceledException)
            {
                logger.LogInformation("Request cancelled");
                return controller.StatusCode(StatusCodes.Status499ClientClosedRequest);
            }
            catch (ArgumentException argEx)
            {
                logger.LogWarning(argEx, "Validation error: {Message}", argEx.Message);
                var pd = new ProblemDetails
                {
                    Title = "Invalid request",
                    Detail = argEx.Message,
                    Status = StatusCodes.Status400BadRequest
                };
                return controller.BadRequest(pd);
            }
            catch (InvalidOperationException invOpEx)
            {
                logger.LogWarning(invOpEx, "Invalid operation: {Message}", invOpEx.Message);
                var pd = new ProblemDetails
                {
                    Title = "Invalid request",
                    Detail = invOpEx.Message,
                    Status = StatusCodes.Status400BadRequest
                };
                return controller.BadRequest(pd);
            }
            catch (NotFoundException nfEx)
            {
                logger.LogWarning(nfEx, "Not found: {Message}", nfEx.Message);
                var pd = new ProblemDetails
                {
                    Title = "Not found",
                    Detail = nfEx.Message,
                    Status = StatusCodes.Status404NotFound
                };
                return controller.NotFound(pd);
            }
            catch (DuplicateEntityException dupEx)
            {
                logger.LogWarning(dupEx, "Conflict: {Message}", dupEx.Message);
                var pd = new ProblemDetails
                {
                    Title = "Conflict",
                    Detail = dupEx.Message,
                    Status = StatusCodes.Status409Conflict
                };
                return controller.Conflict(pd);
            }
            catch (ConcurrencyException concEx)
            {
                logger.LogWarning(concEx, "Concurrency conflict: {Message}", concEx.Message);
                var pd = new ProblemDetails
                {
                    Title = "Conflict",
                    Detail = concEx.Message,
                    Status = StatusCodes.Status409Conflict
                };
                return controller.Conflict(pd);
            }
            catch (ValidationException valEx)
            {
                logger.LogWarning(valEx, "Validation failed: {Message}", valEx.Message);
                var pd = new ProblemDetails
                {
                    Title = "Validation failed",
                    Detail = valEx.Message,
                    Status = StatusCodes.Status400BadRequest
                };
                return controller.BadRequest(pd);
            }
            catch (UnauthorizedAccessException uaEx)
            {
                logger.LogWarning(uaEx, "Unauthorized access: {Message}", uaEx.Message);
                return controller.Forbid();
            }
            catch (Exception ex)
            {
                if (args?.Length > 0)
                    logger.LogError(ex, errorMessage, args);
                else
                    logger.LogError(ex, errorMessage);

                var pd = new ProblemDetails
                {
                    Title = "An unexpected error occurred",
                    Detail = "An unexpected error occurred while processing your request.",
                    Status = StatusCodes.Status500InternalServerError
                };

                return controller.StatusCode(StatusCodes.Status500InternalServerError, pd);
            }
        }
    }
}
