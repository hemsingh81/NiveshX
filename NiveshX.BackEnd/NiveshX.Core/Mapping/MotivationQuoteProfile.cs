using AutoMapper;
using NiveshX.Core.DTOs.MotivationQuote;
using NiveshX.Core.Models;

namespace NiveshX.Core.Mapping
{
    public class MotivationQuoteProfile : Profile
    {
        public MotivationQuoteProfile()
        {
            // Add request -> entity (map allowed fields; ignore audit/soft-delete)
            CreateMap<AddMotivationQuoteRequest, MotivationQuote>()
                .ForMember(dest => dest.Id, opt => opt.Ignore())
                .ForMember(dest => dest.IsActive, opt => opt.Ignore())
                .ForMember(dest => dest.IsDeleted, opt => opt.Ignore())
                .ForMember(dest => dest.CreatedOn, opt => opt.Ignore())
                .ForMember(dest => dest.CreatedBy, opt => opt.Ignore())
                .ForMember(dest => dest.ModifiedOn, opt => opt.Ignore())
                .ForMember(dest => dest.ModifiedBy, opt => opt.Ignore());

            // Edit request -> entity (map mutable fields only)
            CreateMap<EditMotivationQuoteRequest, MotivationQuote>()
                .ForMember(dest => dest.Id, opt => opt.Ignore())
                .ForMember(dest => dest.IsDeleted, opt => opt.Ignore())
                .ForMember(dest => dest.CreatedOn, opt => opt.Ignore())
                .ForMember(dest => dest.CreatedBy, opt => opt.Ignore())
                .ForMember(dest => dest.ModifiedOn, opt => opt.Ignore())
                .ForMember(dest => dest.ModifiedBy, opt => opt.Ignore());
        }
    }
}
