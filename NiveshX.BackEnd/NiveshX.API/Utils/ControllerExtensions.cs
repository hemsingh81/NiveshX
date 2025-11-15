using System;
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
                // Explicit cast to ActionResult resolves the conversion error
                return (ActionResult)result;
            }
            catch (OperationCanceledException)
            {
                logger.LogInformation("Request cancelled");
                return controller.StatusCode(StatusCodes.Status499ClientClosedRequest);
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
                // Return an ObjectResult (which implicitly converts to ActionResult<T>)
                return controller.StatusCode(StatusCodes.Status499ClientClosedRequest);
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
