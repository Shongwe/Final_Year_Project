using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using System.Text;
using Web_API.Data;
using Web_API.Services;
using Microsoft.OpenApi.Models;
using Web_API.Model;
using Web_API;
using Serilog;

var builder = WebApplication.CreateBuilder(args);

Log.Logger = new LoggerConfiguration()
    .WriteTo.Console()
    .WriteTo.File("logs/log.txt", rollingInterval: RollingInterval.Day)
    .CreateLogger();

builder.Host.UseSerilog();

builder.Services.AddControllers();
                

builder.Services.AddScoped<IUserService, UserService>();

builder.Services.AddCors(options =>
{
    options.AddPolicy("corsapp", policy =>
    {
        policy.AllowAnyOrigin()
              .WithMethods("PUT", "DELETE", "GET", "POST", "OPTIONS")
              .AllowAnyHeader();
    });
});

builder.Services.AddDbContext<DataContext>(options =>
    options.UseSqlServer(builder.Configuration.GetConnectionString("DefaultConnection"))
);

builder.Services.AddIdentity<User, IdentityRole>(options =>
{
    options.Password.RequireDigit = true;
    options.Password.RequireLowercase = true;
    options.Password.RequireUppercase = true;
    options.Password.RequiredLength = 5;
})
.AddEntityFrameworkStores<DataContext>()
.AddDefaultTokenProviders();

builder.Services.AddAuthentication(auth =>
{
    auth.DefaultAuthenticateScheme = JwtBearerDefaults.AuthenticationScheme;
    auth.DefaultChallengeScheme = JwtBearerDefaults.AuthenticationScheme;
})
.AddJwtBearer(options =>
{
    options.TokenValidationParameters = new TokenValidationParameters
    {
        ValidateIssuer = true,
        ValidateAudience = true,
        RequireExpirationTime = true,
        ValidateIssuerSigningKey = true,
        IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(builder.Configuration["AuthSettings:Key"])),
        ValidIssuer = builder.Configuration["AuthSettings:Issuer"],
        ValidAudience = builder.Configuration["AuthSettings:Audience"]
    };
});

builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen(c =>
{
    c.SwaggerDoc("v1", new OpenApiInfo { Title = "Web API", Version = "v1" });
    c.OperationFilter<FileUploadOperationFilter>();
    c.AddSecurityDefinition("Bearer", new OpenApiSecurityScheme
    {
        Name = "Authorization",
        Type = SecuritySchemeType.ApiKey,
        Scheme = "bearer",
        BearerFormat = "JWT",
        In = ParameterLocation.Header,
        Description = "JWT Authorization header using the Bearer scheme."
    });
    c.AddSecurityRequirement(new OpenApiSecurityRequirement
    {
        {
            new OpenApiSecurityScheme
            {
                Reference = new OpenApiReference
                {
                    Type = ReferenceType.SecurityScheme,
                    Id = "Bearer"
                }
            },
            Array.Empty<string>()
        }
    });
});

var app = builder.Build();
app.Use(async (context, next) =>
{
    if (context.Request.Method == "OPTIONS")
    {
        context.Response.Headers.Append("Access-Control-Allow-Origin", "*");
        context.Response.Headers.Append("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
        context.Response.Headers.Append("Access-Control-Allow-Headers", "Content-Type, Authorization");
        context.Response.StatusCode = 204;
        return;
    }

    await next();
});


using (var scope = app.Services.CreateScope())
{
    var services = scope.ServiceProvider;
    try
    {
        await DbInitializer.SeedRolesAsync(services);
        var adminEmail = builder.Configuration["AdminSettings:Email"];
        var adminPassword = builder.Configuration["AdminSettings:Password"];
        await DbInitializer.SeedAdminUserAsync(services, adminEmail, adminPassword);
    }
    catch (Exception ex)
    {
        var logger = services.GetRequiredService<ILogger<Program>>();
        logger.LogError(ex, "An error occurred during the seeding of roles or admin user.");
    }
}

if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI(c =>
    {
        string swaggerJsonBasePath = string.IsNullOrWhiteSpace(c.RoutePrefix) ? "." : "..";
        c.SwaggerEndpoint($"{swaggerJsonBasePath}/swagger/v1/swagger.json", "Web API V1");
    });
}
else
{
    app.UseSwagger();
    app.UseSwaggerUI(c =>
    {
        string swaggerJsonBasePath = string.IsNullOrWhiteSpace(c.RoutePrefix) ? "." : "..";
        c.SwaggerEndpoint($"{swaggerJsonBasePath}/swagger/v1/swagger.json", "Web API V1");
    });
}

app.UseHttpsRedirection();
app.UseRouting();
app.UseCors("corsapp");

app.UseAuthentication();
app.UseAuthorization();

app.MapControllers();

app.Run();