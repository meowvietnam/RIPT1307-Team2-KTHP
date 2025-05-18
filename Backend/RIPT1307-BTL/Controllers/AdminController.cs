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
            user.Role = "Staff";
            _context.Users.Add(user);
            _context.SaveChanges();
            return Ok(user);
        }
        [HttpPut("users/{id}")]
        public IActionResult UpdateUser(int id, [FromBody] User updatedUser)
        {
            var user = _context.Users.FirstOrDefault(u => u.UserID == id);
            if (user == null)
            {
                return NotFound($"User with ID {id} not found.");
            }

            // Cập nhật các thuộc tính
            user.Username = updatedUser.Username;
            user.Password = updatedUser.Password;
            user.Email = updatedUser.Email;
            //user.Role = updatedUser.Role;

            _context.SaveChanges();
            return Ok(user);
        }
        [HttpDelete("users/{id}")]
        public IActionResult DeleteUser(int id)
        {
            var user = _context.Users.FirstOrDefault(u => u.UserID == id);
            if (user == null)
            {
                return NotFound($"User with ID {id} not found.");
            }

            _context.Users.Remove(user);
            _context.SaveChanges();
            return Ok(new { message = "User deleted" }); // 204 No Content is the standard response for a successful delete.
                                //  You could also return Ok(new { message = "User deleted" }); if you prefer.
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
        [HttpPut("rooms/{id}")]
        public IActionResult UpdateRoom(int id, [FromBody] Room updatedRoom)
        {
            var existingRoom = _context.Rooms.FirstOrDefault(r => r.RoomID == id);
            if (existingRoom == null)
            {
                return NotFound($"Room with ID {id} not found.");
            }

            // Cập nhật các trường cần thiết
            existingRoom.RoomName = updatedRoom.RoomName;
            existingRoom.RoomType = updatedRoom.RoomType;
            existingRoom.Price = updatedRoom.Price;
            existingRoom.Status = updatedRoom.Status;
            existingRoom.Description = updatedRoom.Description;

            _context.SaveChanges();
            return Ok(existingRoom);
        }
        [HttpDelete("rooms/{id}")]
        public IActionResult DeleteRoom(int id)
        {
            var room = _context.Rooms.FirstOrDefault(r => r.RoomID == id);
            if (room == null)
            {
                return NotFound(new { message = "Room not found" });
            }

            _context.Rooms.Remove(room);
            _context.SaveChanges();
            return Ok(new { message = "Room deleted successfully" });
        }
        [HttpGet("services")]
        public IActionResult GetServices()
        {
            var services = _context.Services.ToList();
            return Ok(services);
        }

        [HttpGet("services/{id}", Name = "GetServiceById")]
        public IActionResult GetServiceById(int id)
        {
            var service = _context.Services.FirstOrDefault(s => s.ServiceID == id);
            if (service == null)
            {
                return NotFound($"Service with ID {id} not found.");
            }
            return Ok(service);
        }

        [HttpPost("services")]
        public IActionResult CreateService([FromBody] Service service)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            _context.Services.Add(service);
            _context.SaveChanges();
            return CreatedAtAction(nameof(GetServiceById), new { id = service.ServiceID }, service);
        }

        [HttpPut("services/{id}")]
        public IActionResult UpdateService(int id, [FromBody] Service updatedService)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            var service = _context.Services.FirstOrDefault(s => s.ServiceID == id);
            if (service == null)
            {
                return NotFound($"Service with ID {id} not found.");
            }

            service.ServiceName = updatedService.ServiceName;
            service.Price = updatedService.Price;
            service.ServiceType = updatedService.ServiceType;

            _context.SaveChanges();
            return Ok(service);
        }

        [HttpDelete("services/{id}")]
        public IActionResult DeleteService(int id)
        {
            var service = _context.Services.FirstOrDefault(s => s.ServiceID == id);
            if (service == null)
            {
                return NotFound($"Service with ID {id} not found.");
            }

            _context.Services.Remove(service);
            _context.SaveChanges();
            return NoContent();
        }

    }
}
