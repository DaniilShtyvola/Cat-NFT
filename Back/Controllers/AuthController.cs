using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Cryptography.KeyDerivation;
using System.Security.Cryptography;
using System.IdentityModel.Tokens.Jwt;
using Microsoft.IdentityModel.Tokens;
using System.Text;
using Microsoft.EntityFrameworkCore;

namespace Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class AuthController : ControllerBase
    {
        private readonly MainDbContext _context;
        private readonly IConfiguration _configuration;

        public AuthController(MainDbContext context, IConfiguration configuration)
        {
            _context = context;
            _configuration = configuration;
        }

        // Регистрация пользователя
        [HttpPost("register")]
        public async Task<IActionResult> Register([FromBody] RegisterRequest request)
        {
            // Проверка на наличие пользователя с таким email
            if (await _context.Users.AnyAsync(u => u.Email == request.Email))
            {
                return BadRequest("A user with this email already exists.");
            }

            // Проверка на наличие пользователя с таким кошельком
            if (await _context.Users.AnyAsync(u => u.WalletAddress == request.WalletAddress))
            {
                return BadRequest("This wallet is already in use.");
            }

            var passwordHash = HashPassword(request.Password);

            // Создание нового пользователя
            var user = new User
            {
                UserName = request.UserName,
                Email = request.Email,
                PasswordHash = passwordHash,
                WalletAddress = request.WalletAddress,
                CreatedAt = DateTime.UtcNow
            };

            // Добавление пользователя в контекст базы данных
            await _context.Users.AddAsync(user);
            await _context.SaveChangesAsync();  // Сохранение изменений в базе данных

            return Ok(new { Message = "The user has been successfully registered." });
        }

        // Авторизация (логин)
        [HttpPost("login")]
        public async Task<IActionResult> Login([FromBody] LoginRequest request)
        {
            // Поиск пользователя в базе данных
            var user = await _context.Users.FirstOrDefaultAsync(u => u.Email == request.Email);
            if (user == null || !VerifyPassword(request.Password, user.PasswordHash))
            {
                return Unauthorized("Invalid email or password.");
            }

            // Генерация JWT токена
            var token = GenerateJwtToken(user);

            return Ok(new { Token = token });
        }

        // Хэширование пароля
        private string HashPassword(string password)
        {
            var salt = new byte[128 / 8]; // Генерация соли
            using (var rng = RandomNumberGenerator.Create())
            {
                rng.GetBytes(salt);
            }

            var hashed = Convert.ToBase64String(KeyDerivation.Pbkdf2(
                password: password,
                salt: salt,
                prf: KeyDerivationPrf.HMACSHA256,
                iterationCount: 10000,
                numBytesRequested: 256 / 8));

            return $"{Convert.ToBase64String(salt)}:{hashed}";
        }

        // Проверка пароля
        private bool VerifyPassword(string enteredPassword, string storedPasswordHash)
        {
            var parts = storedPasswordHash.Split(':');
            var salt = Convert.FromBase64String(parts[0]);
            var hash = parts[1];

            var enteredHash = Convert.ToBase64String(KeyDerivation.Pbkdf2(
                password: enteredPassword,
                salt: salt,
                prf: KeyDerivationPrf.HMACSHA256,
                iterationCount: 10000,
                numBytesRequested: 256 / 8));

            return hash == enteredHash;
        }

        // Генерация JWT токена
        private string GenerateJwtToken(User user)
        {
            var claims = new[]
            {
                new System.Security.Claims.Claim(System.Security.Claims.ClaimTypes.Name, user.UserName),
                new System.Security.Claims.Claim("WalletAddress", user.WalletAddress)
            };

            var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(_configuration["Jwt:SecretKey"]));
            var creds = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);

            var token = new JwtSecurityToken(
                issuer: _configuration["Jwt:Issuer"],
                audience: _configuration["Jwt:Audience"],
                claims: claims,
                expires: DateTime.Now.AddDays(1),
                signingCredentials: creds);

            return new JwtSecurityTokenHandler().WriteToken(token);
        }
    }
}