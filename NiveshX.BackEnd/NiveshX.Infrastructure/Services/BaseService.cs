using AutoMapper;
using Microsoft.Extensions.Logging;
using NiveshX.Core.Interfaces;
using NiveshX.Core.Interfaces.Services;
using NiveshX.Core.Models;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace NiveshX.Infrastructure.Services
{
    public abstract class BaseService
    {
        protected readonly IUnitOfWork UnitOfWork;
        protected readonly IUserContext UserContext;
        protected readonly ILogger Logger;
        protected readonly IMapper Mapper;

        protected BaseService(
            IUnitOfWork unitOfWork,
            ILogger logger,
            IUserContext userContext,
            IMapper mapper)
        {
            UnitOfWork = unitOfWork ?? throw new ArgumentNullException(nameof(unitOfWork));
            Logger = logger ?? throw new ArgumentNullException(nameof(logger));
            UserContext = userContext;
            Mapper = mapper ?? throw new ArgumentNullException(nameof(mapper));
        }

        protected string GetAuditUser()
        {
            var user = UserContext?.UserId;
            return string.IsNullOrWhiteSpace(user) ? "system" : user!;
        }

        protected void SetCreatedAudit(AuditableEntity entity)
        {
            if (entity == null) throw new ArgumentNullException(nameof(entity));
            entity.CreatedOn = DateTime.UtcNow;
            entity.CreatedBy = GetAuditUser();
            entity.IsDeleted = false;
            entity.IsActive = true;
        }

        protected void SetModifiedAudit(AuditableEntity entity)
        {
            if (entity == null) throw new ArgumentNullException(nameof(entity));
            entity.ModifiedOn = DateTime.UtcNow;
            entity.ModifiedBy = GetAuditUser();
        }

        protected static string NormalizeForComparison(string? input)
        {
            return (input ?? string.Empty).Trim().ToLowerInvariant();
        }
    }
}
