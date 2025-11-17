using System;
using System.Collections.Generic;
using System.Threading;
using System.Threading.Tasks;
using AutoMapper;
using Microsoft.Extensions.Logging;
using NiveshX.Core.DTOs.MotivationQuote;
using NiveshX.Core.Exceptions;
using NiveshX.Core.Interfaces;
using NiveshX.Core.Interfaces.Services;
using NiveshX.Core.Models;

namespace NiveshX.Infrastructure.Services
{
    public class MotivationQuoteService : BaseService, IMotivationQuoteService
    {
        public MotivationQuoteService(
            IUnitOfWork unitOfWork,
            ILogger<MotivationQuoteService> logger,
            IUserContext userContext,
            IMapper mapper)
            : base(unitOfWork, logger, userContext, mapper)
        {
        }

        public async Task<IEnumerable<MotivationQuoteResponse>> GetAllAsync(CancellationToken cancellationToken = default)
        {
            try
            {
                Logger.LogInformation("Fetching all motivation quotes");
                var quotes = await UnitOfWork.MotivationQuotes.GetAllAsync(cancellationToken);
                return Mapper.Map<IEnumerable<MotivationQuoteResponse>>(quotes);
            }
            catch (Exception ex)
            {
                Logger.LogError(ex, "Error fetching motivation quotes");
                throw;
            }
        }

        public async Task<IEnumerable<MotivationQuoteResponse>> GetAllActiveAsync(CancellationToken cancellationToken = default)
        {
            try
            {
                Logger.LogInformation("Fetching all active motivation quotes");
                var quotes = await UnitOfWork.MotivationQuotes.GetAllActiveAsync(cancellationToken);
                return Mapper.Map<IEnumerable<MotivationQuoteResponse>>(quotes);
            }
            catch (Exception ex)
            {
                Logger.LogError(ex, "Error fetching active motivation quotes");
                throw;
            }
        }

        public async Task<MotivationQuoteResponse?> GetByIdAsync(Guid id, CancellationToken cancellationToken = default)
        {
            try
            {
                Logger.LogInformation("Fetching motivation quote with ID: {QuoteId}", id);
                var quote = await UnitOfWork.MotivationQuotes.GetByIdAsync(id, cancellationToken);
                return quote == null ? null : Mapper.Map<MotivationQuoteResponse>(quote);
            }
            catch (Exception ex)
            {
                Logger.LogError(ex, "Error fetching motivation quote with ID: {QuoteId}", id);
                throw;
            }
        }

        public async Task<MotivationQuoteResponse> CreateAsync(CreateMotivationQuoteRequest request, CancellationToken cancellationToken = default)
        {
            try
            {
                Logger.LogInformation("Creating motivation quote by author: {Author}", request.Author);

                var exists = await UnitOfWork.MotivationQuotes.ExistsAsync(request.Quote, cancellationToken);
                if (exists)
                    throw new DuplicateEntityException("A motivation quote with the same text already exists.");

                var quote = Mapper.Map<MotivationQuote>(request);

                // populate audit fields via BaseService helper
                SetCreatedAudit(quote);

                await UnitOfWork.MotivationQuotes.AddAsync(quote, cancellationToken);
                await UnitOfWork.SaveChangesAsync(cancellationToken);

                Logger.LogInformation("Motivation quote created: {QuoteId}", quote.Id);
                return Mapper.Map<MotivationQuoteResponse>(quote);
            }
            catch (Exception ex)
            {
                Logger.LogError(ex, "Error creating motivation quote by author: {Author}", request.Author);
                throw;
            }
        }

        public async Task<MotivationQuoteResponse?> UpdateAsync(Guid id, UpdateMotivationQuoteRequest request, CancellationToken cancellationToken = default)
        {
            try
            {
                Logger.LogInformation("Updating motivation quote with ID: {QuoteId}", id);
                var quote = await UnitOfWork.MotivationQuotes.GetByIdAsync(id, cancellationToken);
                if (quote == null)
                    throw new NotFoundException($"Motivation quote not found for update: {id}.");

                var duplicate = await UnitOfWork.MotivationQuotes.ExistsAsync(request.Quote, excludeId: id, cancellationToken);
                if (duplicate)
                    throw new DuplicateEntityException("A motivation quote with the same text already exists.");

                Mapper.Map(request, quote);

                // set audit info
                SetModifiedAudit(quote);

                await UnitOfWork.MotivationQuotes.UpdateAsync(quote, cancellationToken);
                await UnitOfWork.SaveChangesAsync(cancellationToken);

                Logger.LogInformation("Motivation quote updated: {QuoteId}", id);
                return Mapper.Map<MotivationQuoteResponse>(quote);
            }
            catch (Exception ex)
            {
                Logger.LogError(ex, "Error updating motivation quote with ID: {QuoteId}", id);
                throw;
            }
        }

        public async Task<bool> DeleteAsync(Guid id, CancellationToken cancellationToken = default)
        {
            try
            {
                Logger.LogInformation("Attempting to delete motivation quote with ID: {QuoteId}", id);

                var quote = await UnitOfWork.MotivationQuotes.GetByIdAsync(id, cancellationToken)
                            ?? throw new NotFoundException($"Motivation quote not found for deletion: {id}.");

                // soft-delete and set audit fields
                quote.IsDeleted = true;
                SetModifiedAudit(quote);

                await UnitOfWork.MotivationQuotes.UpdateAsync(quote, cancellationToken);
                await UnitOfWork.SaveChangesAsync(cancellationToken);

                Logger.LogInformation("Motivation quote deleted: {QuoteId}", id);
                return true;
            }
            catch (Exception ex)
            {
                Logger.LogError(ex, "Error deleting motivation quote with ID: {QuoteId}", id);
                throw;
            }
        }
    }
}
