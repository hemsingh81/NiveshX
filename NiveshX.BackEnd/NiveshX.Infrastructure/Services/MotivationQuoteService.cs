using Microsoft.Extensions.Logging;
using NiveshX.Core.DTOs.MotivationQuote;
using NiveshX.Core.Interfaces;
using NiveshX.Core.Interfaces.Services;
using NiveshX.Core.Models;
using System;
using System.Threading;
using System.Threading.Tasks;

namespace NiveshX.Infrastructure.Services
{
    public class MotivationQuoteService : IMotivationQuoteService
    {
        private readonly IUnitOfWork _unitOfWork;
        private readonly ILogger<MotivationQuoteService> _logger;

        public MotivationQuoteService(IUnitOfWork unitOfWork, ILogger<MotivationQuoteService> logger)
        {
            _unitOfWork = unitOfWork;
            _logger = logger;
        }

        public async Task<bool> AddQuoteAsync(AddMotivationQuoteRequest request, CancellationToken cancellationToken = default)
        {
            try
            {
                var quote = new MotivationQuote { Quote = request.Quote };
                await _unitOfWork.MotivationQuotes.AddAsync(quote, cancellationToken);
                await _unitOfWork.SaveChangesAsync(cancellationToken);

                _logger.LogInformation("Motivation quote added: {Quote}", request.Quote);
                return true;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error adding motivation quote: {Quote}", request.Quote);
                throw;
            }
        }

        public async Task<bool> EditQuoteAsync(EditMotivationQuoteRequest request, CancellationToken cancellationToken = default)
        {
            try
            {
                var quote = await _unitOfWork.MotivationQuotes.GetByIdAsync(request.Id, cancellationToken);
                if (quote == null)
                {
                    _logger.LogWarning("Edit failed: Quote not found for ID {Id}", request.Id);
                    return false;
                }

                quote.Quote = request.Quote;
                quote.IsActive = request.IsActive;
                quote.ModifiedOn = DateTime.UtcNow;

                await _unitOfWork.MotivationQuotes.UpdateAsync(quote, cancellationToken);
                await _unitOfWork.SaveChangesAsync(cancellationToken);

                _logger.LogInformation("Motivation quote updated: {Id}", request.Id);
                return true;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error editing motivation quote: {Id}", request.Id);
                throw;
            }
        }

        public async Task<bool> DeleteQuoteAsync(Guid id, CancellationToken cancellationToken = default)
        {
            try
            {
                var quote = await _unitOfWork.MotivationQuotes.GetByIdAsync(id, cancellationToken);
                if (quote == null)
                {
                    _logger.LogWarning("Soft delete failed: Quote not found for ID {Id}", id);
                    return false;
                }

                quote.IsDeleted = true;
                quote.IsActive = false;
                quote.ModifiedOn = DateTime.UtcNow;

                await _unitOfWork.MotivationQuotes.UpdateAsync(quote, cancellationToken);
                await _unitOfWork.SaveChangesAsync(cancellationToken);

                _logger.LogInformation("Motivation quote soft-deleted: {Id}", id);
                return true;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error soft-deleting motivation quote: {Id}", id);
                throw;
            }
        }
        public async Task<List<MotivationQuote>> GetAllQuotesAsync(CancellationToken cancellationToken = default)
        {
            try
            {
                var quotes = await _unitOfWork.MotivationQuotes.GetAllAsync(cancellationToken);
                _logger.LogInformation("Retrieved {Count} motivation quotes", quotes.Count);
                return quotes;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error retrieving motivation quotes");
                throw;
            }
        }

        public async Task<MotivationQuote?> GetQuoteByIdAsync(Guid id, CancellationToken cancellationToken = default)
        {
            try
            {
                var quote = await _unitOfWork.MotivationQuotes.GetByIdAsync(id, cancellationToken);
                if (quote == null)
                    _logger.LogWarning("Quote not found for ID: {Id}", id);
                else
                    _logger.LogInformation("Retrieved motivation quote: {Id}", id);

                return quote;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error retrieving motivation quote: {Id}", id);
                throw;
            }
        }

    }
}
