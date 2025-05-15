using Microsoft.AspNetCore.Mvc;
using RIPT1307_BTL.Common;

namespace RIPT1307_BTL.Controllers
{
    [ApiController]
    [Route("admin")]
    public class AdminController : StaffController
    {
        public AdminController(AppDbContext context) : base(context)
        {

        }

        [HttpGet("users")]
        public IActionResult GetUsers()
        {
            var users = _context.Users.ToList();
            return Ok(users);
        }

        [HttpPost("users")]
        public IActionResult CreateUser([FromBody] User user)
        {
            _context.Users.Add(user);
            _context.SaveChanges();
            return Ok(user);
        }

        [HttpGet("rooms")]
        public IActionResult GetRoom()
        {
            var room = _context.Rooms.ToList();
            return Ok(room);
        }

        [HttpPost("rooms")]
        public IActionResult CreateRoom([FromBody] Room room)
        {
            _context.Rooms.Add(room);
            _context.SaveChanges();
            return Ok(room);
        }

      
    }
}
