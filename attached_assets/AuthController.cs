using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using RestoAPP.Data;
using RestoAPP.Models;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;

namespace RestoAPP.Controllers
{
    [Route("api/auth")]
    [ApiController]
    public class AuthController : ControllerBase
    {
        private readonly IConfiguration _configuration;
        private readonly AppDbContext _context;
        private readonly ILogger<AuthController> _logger;

        public AuthController(IConfiguration configuration, AppDbContext context, ILogger<AuthController> logger)
        {
            _configuration = configuration;
            _context = context;
            _logger = logger;
        }

        [HttpPost("login")]
        public async Task<IActionResult> Login([FromBody] LoginRequest model) // ✅ Utilisation du bon modèle
        {
            _logger.LogInformation("Tentative de connexion pour l'utilisateur: {Username}", model.Username);

            // Vérifier si l'utilisateur existe dans la base de données
            var user = await _context.Users.FirstOrDefaultAsync(u => u.username == model.Username);
            if (user == null)
            {
                _logger.LogWarning("Échec de connexion : utilisateur introuvable ({Username})", model.Username);
                return Unauthorized(new { message = "Utilisateur introuvable" });
            }

            // Vérifier si le mot de passe est correct
            if (!BCrypt.Net.BCrypt.Verify(model.Password, user.password))
            {
                _logger.LogWarning("Échec de connexion : mot de passe incorrect ({Username})", model.Username);
                return Unauthorized(new { message = "Mot de passe incorrect" });
            }
            _logger.LogInformation("Connexion réussie pour {Username} avec rôle {Role}", user.username, user.role);
            // ✅ Récupérer le vrai rôle de l'utilisateur depuis la base
            string userRole = user.role; // "Admin" ou "User"

            // ✅ Générer un JWT avec le vrai rôle de l'utilisateur
            var token = GenerateJwtToken(user.username, userRole);
            return Ok(new { Token = token });
        }

        private string GenerateJwtToken(string username, string role)
        {
            var claims = new[]
            {
                new Claim(ClaimTypes.Name, username),
                new Claim(ClaimTypes.Role, role) // ✅ Le rôle est inclus ici !
            };

            var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(_configuration["Jwt:SecretKey"]));
            var creds = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);

            var token = new JwtSecurityToken(
                issuer: _configuration["Jwt:Issuer"],
                audience: _configuration["Jwt:Audience"],
                claims: claims,
                expires: DateTime.Now.AddMinutes(60),
                signingCredentials: creds
            );

            return new JwtSecurityTokenHandler().WriteToken(token);
        }
    }
}
