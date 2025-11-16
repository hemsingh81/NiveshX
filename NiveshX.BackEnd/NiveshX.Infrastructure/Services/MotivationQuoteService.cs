using AutoMapper;
using Microsoft.Extensions.Logging;
using NiveshX.Core.DTOs.MotivationQuote;
using NiveshX.Core.Interfaces;
using NiveshX.Core.Interfaces.Services;
using NiveshX.Core.Models;
using System;
using System.Collections.Generic;
using System.Threading;
using System.Threading.Tasks;

namespace NiveshX.Infrastructure.Services
{
    public class MotivationQuoteService : IMotivationQuoteService
    {
        private readonly IUnitOfWork _unitOfWork;
        private readonly IUserContext _userContext;
        private readonly ILogger<MotivationQuoteService> _logger;
        private readonly IMapper _mapper;

        public MotivationQuoteService(IUnitOfWork unitOfWork, ILogger<MotivationQuoteService> logger, IUserContext userContext, IMapper mapper)
        {
            _unitOfWork = unitOfWork;
            _userContext = userContext;
            _logger = logger;
            _mapper = mapper;
        }

        public async Task<IEnumerable<MotivationQuoteResponse>> GetAllAsync(CancellationToken cancellationToken = default)
        {
            try
            {
                _logger.LogInformation("Fetching all motivation quotes");
                var quotes = await _unitOfWork.MotivationQuotes.GetAllAsync(cancellationToken);
                return _mapper.Map<IEnumerable<MotivationQuoteResponse>>(quotes);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error fetching motivation quotes");
                throw;
            }
        }

        public async Task<IEnumerable<MotivationQuoteResponse>> GetAllActiveAsync(CancellationToken cancellationToken = default)
        {
            try
            {
                _logger.LogInformation("Fetching all motivation quotes");
                var quotes = await _unitOfWork.MotivationQuotes.GetAllActiveAsync(cancellationToken);
                return _mapper.Map<IEnumerable<MotivationQuoteResponse>>(quotes);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error fetching motivation quotes");
                throw;
            }
        }

        public async Task<MotivationQuoteResponse?> GetByIdAsync(Guid id, CancellationToken cancellationToken = default)
        {
            try
            {
                _logger.LogInformation("Fetching motivation quote with ID: {QuoteId}", id);
                var quote = await _unitOfWork.MotivationQuotes.GetByIdAsync(id, cancellationToken);
                return quote == null ? null : _mapper.Map<MotivationQuoteResponse>(quote);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error fetching motivation quote with ID: {QuoteId}", id);
                throw;
            }
        }

        public async Task<MotivationQuoteResponse> CreateAsync(CreateMotivationQuoteRequest request, CancellationToken cancellationToken = default)
        {
            try
            {
                _logger.LogInformation("Creating motivation quote by author: {Author}", request.Author);

                var quote = _mapper.Map<MotivationQuote>(request);
                quote.Id = Guid.NewGuid();
                quote.IsActive = true;
                quote.CreatedOn = DateTime.UtcNow;
                quote.CreatedBy = _userContext.UserId;

                await _unitOfWork.MotivationQuotes.AddAsync(quote, cancellationToken);
                await _unitOfWork.SaveChangesAsync(cancellationToken);

                _logger.LogInformation("Motivation quote created: {QuoteId}", quote.Id);
                return _mapper.Map<MotivationQuoteResponse>(quote);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error creating motivation quote by author: {Author}", request.Author);
                throw;
            }
        }

        public async Task<MotivationQuoteResponse?> UpdateAsync(Guid id, UpdateMotivationQuoteRequest request, CancellationToken cancellationToken = default)
        {
            try
            {
                _logger.LogInformation("Updating motivation quote with ID: {QuoteId}", id);
                var quote = await _unitOfWork.MotivationQuotes.GetByIdAsync(id, cancellationToken);
                if (quote == null)
                {
                    _logger.LogWarning("Motivation quote not found: {QuoteId}", id);
                    return null;
                }

                _mapper.Map(request, quote);

                quote.ModifiedOn = DateTime.UtcNow;
                quote.ModifiedBy = _userContext.UserId;

                await _unitOfWork.MotivationQuotes.UpdateAsync(quote, cancellationToken);
                await _unitOfWork.SaveChangesAsync(cancellationToken);

                _logger.LogInformation("Motivation quote updated: {QuoteId}", id);
                return _mapper.Map<MotivationQuoteResponse>(quote);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error updating motivation quote with ID: {QuoteId}", id);
                throw;
            }
        }

        public async Task<bool> DeleteAsync(Guid id, CancellationToken cancellationToken = default)
        {
            try
            {
                _logger.LogInformation("Attempting to delete motivation quote with ID: {QuoteId}", id);
                var success = await _unitOfWork.MotivationQuotes.DeleteAsync(id, cancellationToken);
                if (success)
                {
                    await _unitOfWork.SaveChangesAsync(cancellationToken);
                    _logger.LogInformation("Motivation quote deleted: {QuoteId}", id);
                }
                else
                {
                    _logger.LogWarning("Motivation quote not found for deletion: {QuoteId}", id);
                }

                return success;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error deleting motivation quote with ID: {QuoteId}", id);
                throw;
            }
        }
    }
}
