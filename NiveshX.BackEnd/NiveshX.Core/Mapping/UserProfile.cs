using AutoMapper;
using NiveshX.Core.DTOs.User;
using NiveshX.Core.Models;

namespace NiveshX.Core.Mapping
{
    public class UserProfile : Profile
    {
        public UserProfile()
        {
            // Entity -> Response
            CreateMap<User, UserResponse>()
                .ForMember(dest => dest.Role, opt => opt.MapFrom(src => src.Role.ToString()));

            // Create request -> entity (map allowed fields only; ignore sensitive/audit fields)
            CreateMap<CreateUserRequest, User>()
                .ForMember(dest => dest.Id, opt => opt.Ignore())
                .ForMember(dest => dest.PasswordHash, opt => opt.Ignore())
                .ForMember(dest => dest.IsEmailConfirmed, opt => opt.Ignore())
                .ForMember(dest => dest.IsPhoneConfirmed, opt => opt.Ignore())
                .ForMember(dest => dest.IsLockedOut, opt => opt.Ignore())
                .ForMember(dest => dest.FailedLoginAttempts, opt => opt.Ignore())
                .ForMember(dest => dest.IsActive, opt => opt.Ignore())
                .ForMember(dest => dest.CreatedOn, opt => opt.Ignore())
                .ForMember(dest => dest.CreatedBy, opt => opt.Ignore())
                .ForMember(dest => dest.ModifiedOn, opt => opt.Ignore())
                .ForMember(dest => dest.ModifiedBy, opt => opt.Ignore());

            // Update request -> entity (map mutable fields only; ignore audit/security fields)
            CreateMap<UpdateUserRequest, User>()
                .ForMember(dest => dest.Id, opt => opt.Ignore())
                .ForMember(dest => dest.PasswordHash, opt => opt.Ignore())
                .ForMember(dest => dest.CreatedOn, opt => opt.Ignore())
                .ForMember(dest => dest.CreatedBy, opt => opt.Ignore())
                .ForMember(dest => dest.ModifiedOn, opt => opt.Ignore())
                .ForMember(dest => dest.ModifiedBy, opt => opt.Ignore());
        }
    }
}
