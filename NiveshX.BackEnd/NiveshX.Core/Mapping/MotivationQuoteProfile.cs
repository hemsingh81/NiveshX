using AutoMapper;
using NiveshX.Core.DTOs.MotivationQuote;
using NiveshX.Core.Models;

namespace NiveshX.Core.Mapping
{
    public class MotivationQuoteProfile : Profile
    {
        public MotivationQuoteProfile()
        {
            CreateMap<CreateMotivationQuoteRequest, MotivationQuote>();
            CreateMap<UpdateMotivationQuoteRequest, MotivationQuote>()
                .ForMember(dest => dest.Id, opt => opt.Ignore())
                .ForMember(dest => dest.CreatedOn, opt => opt.Ignore())
                .ForMember(dest => dest.CreatedBy, opt => opt.Ignore())
                .ForMember(dest => dest.IsDeleted, opt => opt.Ignore());

            CreateMap<MotivationQuote, MotivationQuoteResponse>();
        }
    }
}
