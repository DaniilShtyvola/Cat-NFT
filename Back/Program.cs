using Microsoft.EntityFrameworkCore;

var builder = WebApplication.CreateBuilder(args);

// Добавляем поддержку CORS (политика для localhost)
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowAll", policy =>
    {
        policy.AllowAnyOrigin()  // Разрешает доступ с любого адреса
              .AllowAnyHeader()
              .AllowAnyMethod();
    });
});

// Добавляем DbContext для работы с SQLite
builder.Services.AddDbContext<MainDbContext>(options =>
{
    options.UseSqlite(builder.Configuration.GetConnectionString("DefaultConnection"));
});

// Добавляем контроллеры
builder.Services.AddControllers();
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

var app = builder.Build();

// Применяем CORS политику (для разрешения запросов с нужных доменов)
app.UseCors("AllowAll");

if (app.Environment.IsDevelopment())
{
    // Включаем Swagger для разработки
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.UseHttpsRedirection();
app.UseAuthorization();

// Регистрируем контроллеры для маршрутизации
app.MapControllers();

// Запускаем приложение
app.Run();
