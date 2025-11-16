using System;
using System.Collections.Generic;
using System.Threading;
using System.Threading.Tasks;
using AutoMapper;
using Microsoft.Extensions.Logging;
using NiveshX.Core.DTOs.StockMarket;
using NiveshX.Core.Interfaces;
using NiveshX.Core.Interfaces.Services;
using NiveshX.Core.Models;

namespace NiveshX.Infrastructure.Services
{
    public class StockMarketService : IStockMarketService
    {
        private readonly IUnitOfWork _unitOfWork;
        private readonly IUserContext _userContext;
        private readonly ILogger<StockMarketService> _logger;
        private readonly IMapper _mapper;

        public StockMarketService(IUnitOfWork unitOfWork, ILogger<StockMarketService> logger, IUserContext userContext, IMapper mapper)
        {
            _unitOfWork = unitOfWork;
            _userContext = userContext;
            _logger = logger;
            _mapper = mapper;
        }

        public async Task<IEnumerable<StockMarketResponse>> GetAllAsync(CancellationToken cancellationToken = default)
        {
            var models = await _unitOfWork.StockMarkets.GetAllAsync(cancellationToken);
            return _mapper.Map<IEnumerable<StockMarketResponse>>(models);
        }

        public async Task<StockMarketResponse?> GetByIdAsync(Guid id, CancellationToken cancellationToken = default)
        {
            var model = await _unitOfWork.StockMarkets.GetByIdAsync(id, cancellationToken);
            return model == null ? null : _mapper.Map<StockMarketResponse>(model);
        }

        public async Task<StockMarketResponse> CreateAsync(CreateStockMarketRequest request, CancellationToken cancellationToken = default)
        {
            // Optional: validate country exists
            var country = await _unitOfWork.Countries.GetByIdAsync(request.CountryId, cancellationToken);
            if (country == null) throw new InvalidOperationException("Country not found");

            var entity = _mapper.Map<StockMarket>(request);
            entity.Id = Guid.NewGuid();
            entity.CreatedOn = DateTime.UtcNow;
            entity.CreatedBy = _userContext.UserId;
            entity.IsActive = true;

            await _unitOfWork.StockMarkets.AddAsync(entity, cancellationToken);
            await _unitOfWork.SaveChangesAsync(cancellationToken);

            // reload including Country navigation (or rely on returned entity if tracked)
            var created = await _unitOfWork.StockMarkets.GetByIdAsync(entity.Id, cancellationToken);
            return _mapper.Map<StockMarketResponse>(created!);
        }

        public async Task<StockMarketResponse?> UpdateAsync(Guid id, UpdateStockMarketRequest request, CancellationToken cancellationToken = default)
        {
            var entity = await _unitOfWork.StockMarkets.GetByIdAsync(id, cancellationToken);
            if (entity == null) return null;

            // Optional: validate country exists
            var country = await _unitOfWork.Countries.GetByIdAsync(request.CountryId, cancellationToken);
            if (country == null) throw new InvalidOperationException("Country not found");

            _mapper.Map(request, entity);

            entity.ModifiedOn = DateTime.UtcNow;
            entity.ModifiedBy = _userContext.UserId;

            await _unitOfWork.StockMarkets.UpdateAsync(entity, cancellationToken);
            await _unitOfWork.SaveChangesAsync(cancellationToken);

            var updated = await _unitOfWork.StockMarkets.GetByIdAsync(id, cancellationToken);
            return _mapper.Map<StockMarketResponse>(updated!);
        }

        public async Task<bool> DeleteAsync(Guid id, CancellationToken cancellationToken = default)
        {
            var ok = await _unitOfWork.StockMarkets.DeleteAsync(id, cancellationToken);
            if (!ok) return false;
            await _unitOfWork.SaveChangesAsync(cancellationToken);
            return true;
        }
    }
}
