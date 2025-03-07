using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using RestoAPP.Data;
using RestoAPP.Exceptions;
using RestoAPP.Models;

namespace RestoAPP.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class FoodsController : ControllerBase
    {
        private readonly AppDbContext _context;

        public FoodsController(AppDbContext context)
        {
            _context = context;
        }

        // GET: api/Foods
        [Authorize(Roles = "Admin,User")]
        [HttpGet]
        public async Task<ActionResult<IEnumerable<Foods>>> GetFoods()
        {
            return await _context.Foods.ToListAsync();
        }

        // GET: api/Foods/5
        [Authorize(Roles = "Admin,User")]
        [HttpGet("{id}")]
        public async Task<ActionResult<Foods>> GetFoods(int id)
        {
            var foods = await _context.Foods.FindAsync(id);

            if (foods == null)
            {
                throw new NotFoundException($"Le plat avec l'ID {id} n'existe pas.");
            }

            return Ok(foods);
        }

        // PUT: api/Foods/5
        // To protect from overposting attacks, see https://go.microsoft.com/fwlink/?linkid=2123754
        [Authorize(Roles = "Admin")]
        [HttpPut("{id}")]
        public async Task<IActionResult> PutFoods(int id, Foods foods)
        {
            if (id != foods.id)
            {
                return BadRequest();
            }

            _context.Entry(foods).State = EntityState.Modified;

            try
            {
                await _context.SaveChangesAsync();
            }
            catch (DbUpdateConcurrencyException)
            {
                if (!FoodsExists(id))
                {
                    return NotFound();
                }
                else
                {
                    throw;
                }
            }

            return NoContent();
        }

        // POST: api/Foods
        // To protect from overposting attacks, see https://go.microsoft.com/fwlink/?linkid=2123754
        
        [HttpPost]
        public async Task<ActionResult<Foods>> PostFoods(Foods foods)
        {
            _context.Foods.Add(foods);
            await _context.SaveChangesAsync();

            return CreatedAtAction("GetFoods", new { id = foods.id }, foods);
        }

        // DELETE: api/Foods/5
        [Authorize(Roles = "Admin")]
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteFoods(int id)
        {
            var foods = await _context.Foods.FindAsync(id);
            if (foods == null)
            {
                throw new KeyNotFoundException($"Le plat avec l'ID {id} n'existe pas.");
            }

            _context.Foods.Remove(foods);
            await _context.SaveChangesAsync();

            return NoContent();
        }

        private bool FoodsExists(int id)
        {
            return _context.Foods.Any(e => e.id == id);
        }
    }
}
