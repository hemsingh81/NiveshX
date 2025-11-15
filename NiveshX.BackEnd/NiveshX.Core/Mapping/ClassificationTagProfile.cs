using AutoMapper;
using NiveshX.Core.DTOs.ClassificationTag;
using NiveshX.Core.Models;

namespace NiveshX.Core.Mapping
{
    public class ClassificationTagProfile : Profile
    {
        public ClassificationTagProfile()
        {
            // Entity -> Response
            CreateMap<ClassificationTag, ClassificationTagResponse>();

            // Create request -> entity (ignore audit fields)
            CreateMap<CreateClassificationTagRequest, ClassificationTag>()
                .ForMember(dest => dest.Id, opt => opt.Ignore())
                .ForMember(dest => dest.IsActive, opt => opt.Ignore())
                .ForMember(dest => dest.CreatedOn, opt => opt.Ignore())
                .ForMember(dest => dest.CreatedBy, opt => opt.Ignore())
                .ForMember(dest => dest.ModifiedOn, opt => opt.Ignore())
                .ForMember(dest => dest.ModifiedBy, opt => opt.Ignore());

            // Update request -> entity (map mutable fields only)
            CreateMap<UpdateClassificationTagRequest, ClassificationTag>()
                .ForMember(dest => dest.Id, opt => opt.Ignore())
                .ForMember(dest => dest.CreatedOn, opt => opt.Ignore())
                .ForMember(dest => dest.CreatedBy, opt => opt.Ignore())
                .ForMember(dest => dest.ModifiedOn, opt => opt.Ignore())
                .ForMember(dest => dest.ModifiedBy, opt => opt.Ignore());
        }

    }
}
