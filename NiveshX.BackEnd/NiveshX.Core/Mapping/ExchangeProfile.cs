using AutoMapper;
using NiveshX.Core.DTOs.Country;
using NiveshX.Core.DTOs.Exchange;
using NiveshX.Core.Models;

namespace NiveshX.Core.Mapping
{
    public class ExchangeProfile : Profile
    {
        public ExchangeProfile()
        {
            // Country -> CountryResponse
            CreateMap<Country, CountryResponse>();

            // Entity -> Response
            CreateMap<Exchange, ExchangeResponse>()
                .ForMember(dest => dest.Country, opt => opt.MapFrom(src => src.Country));

            // DTO -> Entity (Create) - map scalar CountryId, ignore navigation
            CreateMap<CreateExchangeRequest, Exchange>()
                .ForMember(dest => dest.Id, opt => opt.Ignore())
                .ForMember(dest => dest.IsActive, opt => opt.MapFrom(_ => true))
                .ForMember(dest => dest.CreatedOn, opt => opt.Ignore())
                .ForMember(dest => dest.CreatedBy, opt => opt.Ignore())
                .ForMember(dest => dest.Country, opt => opt.Ignore()); // assign Country in service

            // DTO -> Entity (Update)
            CreateMap<UpdateExchangeRequest, Exchange>()
                .ForMember(dest => dest.Id, opt => opt.Ignore())
                .ForMember(dest => dest.CreatedOn, opt => opt.Ignore())
                .ForMember(dest => dest.CreatedBy, opt => opt.Ignore())
                .ForMember(dest => dest.ModifiedOn, opt => opt.Ignore())
                .ForMember(dest => dest.ModifiedBy, opt => opt.Ignore())
                .ForMember(dest => dest.Country, opt => opt.Ignore());
        }
    }
}
