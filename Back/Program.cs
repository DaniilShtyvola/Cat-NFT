using Microsoft.EntityFrameworkCore;

var builder = WebApplication.CreateBuilder(args);

// ��������� ��������� CORS (�������� ��� localhost)
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowAll", policy =>
    {
        policy.AllowAnyOrigin()  // ��������� ������ � ������ ������
              .AllowAnyHeader()
              .AllowAnyMethod();
    });
});

// ��������� DbContext ��� ������ � SQLite
builder.Services.AddDbContext<MainDbContext>(options =>
{
    options.UseSqlite(builder.Configuration.GetConnectionString("DefaultConnection"));
});

// ��������� �����������
builder.Services.AddControllers();
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

var app = builder.Build();

// ��������� CORS �������� (��� ���������� �������� � ������ �������)
app.UseCors("AllowAll");

if (app.Environment.IsDevelopment())
{
    // �������� Swagger ��� ����������
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.UseHttpsRedirection();
app.UseAuthorization();

// ������������ ����������� ��� �������������
app.MapControllers();

// ��������� ����������
app.Run();
