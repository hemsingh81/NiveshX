using AutoMapper;
using NiveshX.Core.DTOs.Country;
using NiveshX.Core.DTOs.StockMarket;
using NiveshX.Core.Models;

namespace NiveshX.Core.Mapping
{
    public class StockMarketProfile : Profile
    {
        public StockMarketProfile()
        {
            // map Country -> CountryResponse (required for nested mapping)
            CreateMap<Country, CountryResponse>();

            CreateMap<StockMarket, StockMarketResponse>()
                // AutoMapper will populate Country nested object if Country is included
                .ForMember(dest => dest.Country, opt => opt.MapFrom(src => src.Country));

            CreateMap<CreateStockMarketRequest, StockMarket>()
                .ForMember(dest => dest.Id, opt => opt.Ignore())
                .ForMember(dest => dest.IsActive, opt => opt.MapFrom(_ => true))
                .ForMember(dest => dest.CreatedOn, opt => opt.Ignore())
                .ForMember(dest => dest.CreatedBy, opt => opt.Ignore())
                .ForAllMembers(opt => opt.Condition((src, dest, srcMember) => srcMember != null));

            CreateMap<UpdateStockMarketRequest, StockMarket>()
                .ForMember(dest => dest.Id, opt => opt.Ignore())
                .ForMember(dest => dest.CreatedOn, opt => opt.Ignore())
                .ForMember(dest => dest.CreatedBy, opt => opt.Ignore())
                .ForMember(dest => dest.ModifiedOn, opt => opt.Ignore())
                .ForMember(dest => dest.ModifiedBy, opt => opt.Ignore())
                .ForAllMembers(opt => opt.Condition((src, dest, srcMember) => srcMember != null));
        }
    }
}
