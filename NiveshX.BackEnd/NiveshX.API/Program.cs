using AutoMapper;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.IdentityModel.Tokens;
using Microsoft.OpenApi.Models;
using NiveshX.API.Middlewares;
using NiveshX.Core.Config;
using NiveshX.Core.Interfaces;
using NiveshX.Core.Interfaces.Services;
using NiveshX.Core.Mapping;
using NiveshX.Infrastructure.Data;
using NiveshX.Infrastructure.Repositories;
using NiveshX.Infrastructure.Services;
using System.Text;
using System.Text.Json.Serialization;

var builder = WebApplication.CreateBuilder(args);

// ---- Bind and validate JWT settings ----
var jwtSection = builder.Configuration.GetSection("Jwt");
builder.Services.Configure<JwtOptions>(jwtSection);
var jwtKey = jwtSection.GetValue<string>("Key");
if (string.IsNullOrWhiteSpace(jwtKey))
{
    throw new InvalidOperationException("JWT:Key is not configured. Please set Jwt:Key in configuration.");
}

// ---- DbContext ----
builder.Services.AddDbContext<AppDbContext>(options =>
    options.UseSqlServer(builder.Configuration.GetConnectionString("DefaultConnection")));

// ---- AutoMapper - scan mapping assembly (register all profiles) ----
builder.Services.AddAutoMapper(cfg => cfg.AddProfile<CountryProfile>());
builder.Services.AddAutoMapper(cfg => cfg.AddProfile<IndustryProfile>());
builder.Services.AddAutoMapper(cfg => cfg.AddProfile<ClassificationTagProfile>());
builder.Services.AddAutoMapper(cfg => cfg.AddProfile<SectorProfile>());
builder.Services.AddAutoMapper(cfg => cfg.AddProfile<MotivationQuoteProfile>());
builder.Services.AddAutoMapper(cfg => cfg.AddProfile<UserProfile>());

// ---- HttpContext / user context ----
builder.Services.AddHttpContextAccessor();
builder.Services.AddScoped<IUserContext, UserContext>();

// ---- Application services / repositories ----
builder.Services.AddScoped<IUnitOfWork, UnitOfWork>();
builder.Services.AddScoped<IAuthService, AuthService>();
builder.Services.AddScoped<IUserManagementService, UserManagementService>();
builder.Services.AddScoped<IMotivationQuoteService, MotivationQuoteService>();
builder.Services.AddScoped<ICountryService, CountryService>();
builder.Services.AddScoped<IIndustryService, IndustryService>();
builder.Services.AddScoped<ISectorService, SectorService>();
builder.Services.AddScoped<IClassificationTagService, ClassificationTagService>();
builder.Services.AddScoped<IStockMarketService, StockMarketService>();

// ---- Authentication (JWT) ----
builder.Services.AddAuthentication("Bearer")
    .AddJwtBearer("Bearer", options =>
    {
        options.RequireHttpsMetadata = true;
        options.SaveToken = true;
        options.TokenValidationParameters = new TokenValidationParameters
        {
            ValidateIssuer = false,
            ValidateAudience = false,
            ValidateLifetime = true,
            ValidateIssuerSigningKey = true,
            IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(jwtKey))
        };
    });

// ---- CORS ----
var MyAllowSpecificOrigins = "_myAllowSpecificOrigins";
builder.Services.AddCors(options =>
{
    options.AddPolicy(name: MyAllowSpecificOrigins, policy =>
    {
        policy.WithOrigins("http://localhost:3000")
              .AllowAnyHeader()
              .AllowAnyMethod()
              .AllowCredentials();
    });
});

// ---- Swagger ----
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen(c =>
{
    c.SwaggerDoc("v1", new() { Title = "NiveshX API", Version = "v1" });

    c.AddSecurityDefinition("Bearer", new()
    {
        Description = "Enter 'Bearer' [space] and then your token",
        Name = "Authorization",
        In = ParameterLocation.Header,
        Type = SecuritySchemeType.ApiKey,
        Scheme = "Bearer"
    });

    c.AddSecurityRequirement(new()
    {
        {
            new OpenApiSecurityScheme
            {
                Reference = new() { Type = ReferenceType.SecurityScheme, Id = "Bearer" }
            },
            Array.Empty<string>()
        }
    });
});

// ---- Controllers + JSON options (single call) ----
builder.Services.AddControllers()
    .AddJsonOptions(options =>
    {
        options.JsonSerializerOptions.Converters.Add(new JsonStringEnumConverter());
    });

var app = builder.Build();

// ---- Error handling and middleware ordering ----
if (app.Environment.IsDevelopment())
{
    app.UseDeveloperExceptionPage();
}
else
{
    app.UseExceptionHandler("/error");
}

// Custom exception middleware
app.UseMiddleware<ExceptionMiddleware>();

app.UseHttpsRedirection();
app.UseStaticFiles();

// Ensure routing is used before CORS/auth
app.UseRouting();

app.UseCors(MyAllowSpecificOrigins);

app.UseAuthentication();
app.UseAuthorization();

// Swagger (non-production)
if (!app.Environment.IsProduction())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.MapControllers();

app.Run();
