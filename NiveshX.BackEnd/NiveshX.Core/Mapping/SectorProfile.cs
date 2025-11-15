using AutoMapper;
using NiveshX.Core.DTOs.Sector;
using NiveshX.Core.Models;

namespace NiveshX.Core.Mapping
{
    public class SectorProfile : Profile
    {
        public SectorProfile()
        {
            // Entity -> Response
            CreateMap<Sector, SectorResponse>();

            // Create request -> Entity (ignore audit fields)
            CreateMap<CreateSectorRequest, Sector>()
                .ForMember(dest => dest.Id, opt => opt.Ignore())
                .ForMember(dest => dest.IsActive, opt => opt.Ignore())
                .ForMember(dest => dest.CreatedOn, opt => opt.Ignore())
                .ForMember(dest => dest.CreatedBy, opt => opt.Ignore())
                .ForMember(dest => dest.ModifiedOn, opt => opt.Ignore())
                .ForMember(dest => dest.ModifiedBy, opt => opt.Ignore());

            // Update request -> Entity (map mutable fields only)
            CreateMap<UpdateSectorRequest, Sector>()
                .ForMember(dest => dest.Id, opt => opt.Ignore())
                .ForMember(dest => dest.CreatedOn, opt => opt.Ignore())
                .ForMember(dest => dest.CreatedBy, opt => opt.Ignore())
                .ForMember(dest => dest.ModifiedOn, opt => opt.Ignore())
                .ForMember(dest => dest.ModifiedBy, opt => opt.Ignore());
        }
    }
}
