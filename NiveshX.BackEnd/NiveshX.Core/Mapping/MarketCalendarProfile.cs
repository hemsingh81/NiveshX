using AutoMapper;
using NiveshX.Core.DTOs;
using NiveshX.Core.Models;

namespace NiveshX.Core.Mapping
{
    public class MarketCalendarProfile : Profile
    {
        public MarketCalendarProfile()
        {
            // Create: map request -> entity, but ignore audit, id, RowVersion and navigation
            CreateMap<CreateMarketCalendarRequest, MarketCalendar>()
                .ForMember(d => d.Id, opt => opt.Ignore())
                .ForMember(d => d.Exchange, opt => opt.Ignore())
                .ForMember(d => d.IsDeleted, opt => opt.Ignore())
                .ForMember(d => d.CreatedOn, opt => opt.Ignore())
                .ForMember(d => d.CreatedBy, opt => opt.Ignore())
                .ForMember(d => d.ModifiedOn, opt => opt.Ignore())
                .ForMember(d => d.ModifiedBy, opt => opt.Ignore())
                .ForMember(d => d.RowVersion, opt => opt.Ignore());

            // Update: map allowed fields but ignore RowVersion (we'll supply OriginalValue on the EF Entry)
            CreateMap<UpdateMarketCalendarRequest, MarketCalendar>()
                .ForMember(d => d.Id, opt => opt.Ignore())
                .ForMember(d => d.Exchange, opt => opt.Ignore())
                .ForMember(d => d.IsDeleted, opt => opt.Ignore())
                .ForMember(d => d.CreatedOn, opt => opt.Ignore())
                .ForMember(d => d.CreatedBy, opt => opt.Ignore())
                .ForMember(d => d.ModifiedOn, opt => opt.Ignore())
                .ForMember(d => d.ModifiedBy, opt => opt.Ignore())
                .ForMember(d => d.RowVersion, opt => opt.Ignore());

            // Response mapping includes RowVersion bytes (serialized as base64 by default JSON serializer)
            CreateMap<MarketCalendar, MarketCalendarResponse>()
                .ForMember(d => d.RowVersion, opt => opt.MapFrom(s => s.RowVersion));
        }
    }
}
