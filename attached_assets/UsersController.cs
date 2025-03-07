using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using RestoAPP.Data;
using RestoAPP.Models;
using BCrypt.Net;

namespace RestoAPP.Controllers
{
    [Route("api/user")]
    [ApiController]
    public class UserController : ControllerBase
    {
        private readonly AppDbContext _context;

        public UserController(AppDbContext context)
        {
            _context = context;
        }

        [HttpPost("register")]
        public async Task<IActionResult> Register([FromBody] Users user)
        {
            // Vérifier si le champ username est vide
            if (string.IsNullOrWhiteSpace(user.username) || string.IsNullOrWhiteSpace(user.password))
            {
                return BadRequest("Le nom d'utilisateur et le mot de passe sont obligatoires.");
            }

            // Vérifier si l'utilisateur existe déjà
            var existingUser = await _context.Users
                .FirstOrDefaultAsync(u => u.username == user.username);
            if (existingUser != null)
            {
                return BadRequest(new { message = "Username déjà pris" });
            }

            // Hacher le mot de passe
            user.password = BCrypt.Net.BCrypt.HashPassword(user.password);
            user.role = "User"; // Par défaut, le rôle est "User"

            // Ajouter l'utilisateur à la base de données
            _context.Users.Add(user);
            await _context.SaveChangesAsync();

            return Ok(new { message = "Inscription réussie !" });
        }
    }
}
