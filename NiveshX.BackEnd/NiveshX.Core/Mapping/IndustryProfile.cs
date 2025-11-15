using AutoMapper;
using NiveshX.Core.DTOs.Industry;
using NiveshX.Core.Models;

namespace NiveshX.Core.Mapping
{
    public class IndustryProfile : Profile
    {
        public IndustryProfile()
        {
            // Entity -> Response
            CreateMap<Industry, IndustryResponse>();

            // Create request -> Entity (ignore audit fields)
            CreateMap<CreateIndustryRequest, Industry>()
                .ForMember(dest => dest.Id, opt => opt.Ignore())
                .ForMember(dest => dest.IsActive, opt => opt.Ignore())
                .ForMember(dest => dest.CreatedOn, opt => opt.Ignore())
                .ForMember(dest => dest.CreatedBy, opt => opt.Ignore())
                .ForMember(dest => dest.ModifiedOn, opt => opt.Ignore())
                .ForMember(dest => dest.ModifiedBy, opt => opt.Ignore());

            // Update request -> Entity (map mutable fields only)
            CreateMap<UpdateIndustryRequest, Industry>()
                .ForMember(dest => dest.Id, opt => opt.Ignore())
                .ForMember(dest => dest.CreatedOn, opt => opt.Ignore())
                .ForMember(dest => dest.CreatedBy, opt => opt.Ignore())
                .ForMember(dest => dest.ModifiedOn, opt => opt.Ignore())
                .ForMember(dest => dest.ModifiedBy, opt => opt.Ignore());
        }
    }
}
