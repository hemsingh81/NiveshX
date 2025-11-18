using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using Microsoft.OpenApi.Models;
using NiveshX.API.Middlewares;
using NiveshX.API.Utils;
using NiveshX.Core.Config;
using NiveshX.Core.Interfaces;
using NiveshX.Core.Interfaces.Services;
using NiveshX.Core.Mapping;
using NiveshX.Infrastructure.Data;
using NiveshX.Infrastructure.Repositories;
using NiveshX.Infrastructure.Services;
using System.Text;
using System.Text.Json;
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

// ---- HttpContext / user context ----
builder.Services.AddHttpContextAccessor();
builder.Services.AddScoped<IUserContext, UserContext>();

// ---- DbContext ----
builder.Services.AddDbContext<AppDbContext>(options =>
    options.UseSqlServer(builder.Configuration.GetConnectionString("DefaultConnection")));

// ---- AutoMapper - register profiles ----
builder.Services.AddAutoMapper(cfg => cfg.AddProfile<CountryProfile>());
builder.Services.AddAutoMapper(cfg => cfg.AddProfile<IndustryProfile>());
builder.Services.AddAutoMapper(cfg => cfg.AddProfile<ClassificationTagProfile>());
builder.Services.AddAutoMapper(cfg => cfg.AddProfile<SectorProfile>());
builder.Services.AddAutoMapper(cfg => cfg.AddProfile<MotivationQuoteProfile>());
builder.Services.AddAutoMapper(cfg => cfg.AddProfile<UserProfile>());
builder.Services.AddAutoMapper(cfg => cfg.AddProfile<ExchangeProfile>());


// ---- Application services / repositories ----
builder.Services.AddScoped<IUnitOfWork, UnitOfWork>();
builder.Services.AddScoped<IAuthService, AuthService>();
builder.Services.AddScoped<IUserManagementService, UserManagementService>();
builder.Services.AddScoped<IMotivationQuoteService, MotivationQuoteService>();
builder.Services.AddScoped<ICountryService, CountryService>();
builder.Services.AddScoped<IIndustryService, IndustryService>();
builder.Services.AddScoped<ISectorService, SectorService>();
builder.Services.AddScoped<IClassificationTagService, ClassificationTagService>();
builder.Services.AddScoped<IExchangeService, ExchangeService>();

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

// ---- Controllers + JSON options ----
builder.Services.AddControllers()
    .AddJsonOptions(options =>
    {
        // Register converter for nullable Guid
        options.JsonSerializerOptions.Converters.Add(new NullableGuidConverter());
        options.JsonSerializerOptions.Converters.Add(new JsonStringEnumConverter());
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

// ---- Unify ModelState response ----
builder.Services.Configure<ApiBehaviorOptions>(options =>
{
    options.InvalidModelStateResponseFactory = context =>
    {
        var modelState = context.ModelState;
        var errors = new Dictionary<string, string[]>(StringComparer.OrdinalIgnoreCase);

        foreach (var kvp in modelState.Where(ms => ms.Value?.Errors?.Count > 0))
        {
            var rawKey = kvp.Key;
            var normalizedKey = ErrorFormatting.NormalizeModelStateKey(rawKey);
            var messages = kvp.Value!.Errors.Select(e =>
            {
                var raw = e.ErrorMessage ?? e.Exception?.Message ?? "";
                return ErrorFormatting.NormalizeMessage(raw, normalizedKey);
            }).ToArray();

            errors[normalizedKey] = (errors.ContainsKey(normalizedKey) ? errors[normalizedKey].Concat(messages).ToArray() : messages);
        }

        var responseObj = new
        {
            type = "https://tools.ietf.org/html/rfc9110#section-15.5.1",
            title = "One or more validation errors occurred.",
            status = 400,
            errors
        };

        return new BadRequestObjectResult(responseObj);
    };
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

// Normalize JSON deserialization errors into the same shape
app.Use(async (context, next) =>
{
    try
    {
        await next();
    }
    catch (JsonException ex)
    {
        var path = ex.Path ?? "request";
        var normalizedKey = ErrorFormatting.NormalizeKey(path);

        var responseObj = new
        {
            type = "https://tools.ietf.org/html/rfc9110#section-15.5.1",
            title = "One or more validation errors occurred.",
            status = 400,
            errors = new Dictionary<string, string[]>
            {
                { normalizedKey, new[] { ex.Message } }
            }
        };

        context.Response.StatusCode = 400;
        context.Response.ContentType = "application/json";
        await context.Response.WriteAsJsonAsync(responseObj);
        return;
    }
});

app.UseHttpsRedirection();
app.UseStaticFiles();

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

// Apply ExceptionMiddleware to all routes except Swagger UI/resources
app.UseWhen(
    ctx => !ctx.Request.Path.StartsWithSegments("/swagger", StringComparison.OrdinalIgnoreCase),
    branch =>
    {
        branch.UseMiddleware<ExceptionMiddleware>();
    }
);

app.MapControllers();

app.Run();
