using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using RIPT1307_BTL.Controllers; // Đảm bảo namespace này đúng nếu AppDbContext nằm ở đây
using System.Text;
using System.Text.Json.Serialization; // Thêm using này cho JsonStringEnumConverter

// Đảm bảo bạn có AppDbContext ở đây hoặc trong một namespace khác và đã using nó
// using YourProjectName.Data; // Ví dụ nếu AppDbContext nằm trong YourProjectName.Data

var builder = WebApplication.CreateBuilder(args);

// Add services to the container.

// CẤU HÌNH JSON SERIALIZER ĐỂ XỬ LÝ CAMELCASE VÀ ENUM STRING
builder.Services.AddControllers()
    .AddJsonOptions(options =>
    {
        // Đảm bảo tên thuộc tính JSON là camelCase (ví dụ: "status" từ frontend)
        // sẽ được ánh xạ đúng với PascalCase (ví dụ: "Status" ở C#).
        options.JsonSerializerOptions.PropertyNamingPolicy = System.Text.Json.JsonNamingPolicy.CamelCase;

        // Nếu bạn có các Enum trong DTO/Model (ví dụ: RoomStatus là một Enum),
        // và muốn chúng được serialize/deserialize dưới dạng chuỗi (ví dụ: "Available", "In Use")
        // thay vì giá trị số (0, 1, 2), hãy thêm Converter này.
        // Bạn cần đảm bảo Enum của bạn được định nghĩa đúng ở C#.
        options.JsonSerializerOptions.Converters.Add(new JsonStringEnumConverter());
    });

builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowFrontend",
        policy =>
        {
            // Đảm bảo bạn đặt đúng origin của frontend của bạn.
            // Nếu frontend chạy trên cổng 3000, hãy đổi thành "http://localhost:3000"
            policy.WithOrigins("http://localhost:8000", "http://localhost:3000")
                  .AllowAnyHeader()
                  .AllowAnyMethod();
        });
});


var connectionString = builder.Configuration.GetConnectionString("DefaultConnection");
builder.Services.AddDbContext<AppDbContext>(options =>
    options.UseMySql(connectionString, ServerVersion.AutoDetect(connectionString)));


// CẤU HÌNH AUTHENTICATION (JWT Bearer)
builder.Services.AddAuthentication(options =>
{
    options.DefaultAuthenticateScheme = JwtBearerDefaults.AuthenticationScheme;
    options.DefaultChallengeScheme = JwtBearerDefaults.AuthenticationScheme;
}).AddJwtBearer(options =>
{
    options.TokenValidationParameters = new TokenValidationParameters
    {
        ValidateIssuer = true,
        ValidateAudience = true,
        ValidateLifetime = true,
        ValidateIssuerSigningKey = true,
        ValidIssuer = builder.Configuration["Jwt:Issuer"],
        ValidAudience = builder.Configuration["Jwt:Audience"],
        IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(builder.Configuration["Jwt:Key"]))
    };
});

// CẤU HÌNH AUTHORIZATION
builder.Services.AddAuthorization();


// Learn more about configuring Swagger/OpenAPI at https://aka.ms/aspnetcore/swashbuckle
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

var app = builder.Build();

// Configure the HTTP request pipeline.
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.UseHttpsRedirection();

app.UseCors("AllowFrontend"); // Sử dụng chính sách CORS đã định nghĩa
app.UseRouting();

app.UseAuthentication(); // <-- PHẢI CÓ DÒNG NÀY TRƯỚC UseAuthorization
app.UseAuthorization();  // <-- PHẢI CÓ DÒNG NÀY

app.MapControllers(); // Ánh xạ các Controller

app.Run(); // Chạy ứng dụng