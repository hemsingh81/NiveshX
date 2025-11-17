using System;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Logging;

namespace NiveshX.API.Utils
{
    /// <summary>
    /// Helper extensions for controllers to centralize try/catch, logging and consistent error responses.
    /// Place this file under NiveshX.API/Utils.
    /// </summary>
    public static class ControllerExtensions
    {
        /// <summary>
        /// Domain exceptions that callers can throw from services to indicate specific HTTP semantics.
        /// Use NotFoundException for 404, DuplicateEntityException for 409, ArgumentException / InvalidOperationException for 400.
        /// </summary>
        public class NotFoundException : Exception { public NotFoundException(string message) : base(message) { } }
        public class DuplicateEntityException : Exception { public DuplicateEntityException(string message) : base(message) { } }

        /// <summary>
        /// Execute an async work item that returns an IActionResult and centralize exception handling.
        /// Use this for actions that return plain IActionResult (NoContent, Ok, NotFound, etc.).
        /// </summary>
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

        /// <summary>
        /// Execute an async work item that returns ActionResult<T> and centralize exception handling.
        /// Use this for actions that return typed responses (ActionResult<T>).
        /// </summary>
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
