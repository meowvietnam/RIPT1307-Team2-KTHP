using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using RIPT1307_BTL.Common;

namespace RIPT1307_BTL.Controllers
{
    [ApiController]
    [Route("staffController")]
    public class StaffController : ControllerBase
    {
        protected readonly AppDbContext _context;


        public StaffController(AppDbContext context)
        {
            _context = context;
        }


        // RoomService Endpoints
        [HttpGet("roomservices")]
        public IActionResult GetRoomServices()
        {
            // Eager loading to include related Room and Service data
            var roomServices = _context.RoomServices
                .Include(rs => rs.Room)
                .Include(rs => rs.Service)
                .ToList();
            return Ok(roomServices);
        }

        [HttpGet("roomservices/{id}", Name = "GetRoomServiceById")]
        public IActionResult GetRoomServiceById(int id)
        {
            var roomService = _context.RoomServices
                .Include(rs => rs.Room)
                .Include(rs => rs.Service)
                .FirstOrDefault(rs => rs.ID == id);

            if (roomService == null)
            {
                return NotFound($"RoomService with ID {id} not found");
            }

            return Ok(roomService);
        }


        [HttpPost("roomservices")]
        public IActionResult CreateRoomService([FromBody] RoomService roomService)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            // Kiểm tra xem RoomID và ServiceID có tồn tại không
            var roomExists = _context.Rooms.Any(r => r.RoomID == roomService.RoomID);
            var serviceExists = _context.Services.Any(s => s.ServiceID == roomService.ServiceID);

            if (!roomExists || !serviceExists)
            {
                return BadRequest("Invalid RoomID or ServiceID.");
            }
            _context.RoomServices.Add(roomService);
            _context.SaveChanges();
            return CreatedAtAction(nameof(GetRoomServiceById), new { id = roomService.ID }, roomService);
        }

        [HttpPut("roomservices/{id}")]
        public IActionResult UpdateRoomService(int id, [FromBody] RoomService updatedRoomService)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }
            var roomService = _context.RoomServices.FirstOrDefault(rs => rs.ID == id);
            if (roomService == null)
            {
                return NotFound($"RoomService with ID {id} not found.");
            }

            // Kiểm tra xem RoomID và ServiceID có tồn tại không
            var roomExists = _context.Rooms.Any(r => r.RoomID == updatedRoomService.RoomID);
            var serviceExists = _context.Services.Any(s => s.ServiceID == updatedRoomService.ServiceID);
            if (!roomExists || !serviceExists)
            {
                return BadRequest("Invalid RoomID or ServiceID.");
            }

            roomService.RoomID = updatedRoomService.RoomID;
            roomService.ServiceID = updatedRoomService.ServiceID;
            roomService.Quantity = updatedRoomService.Quantity;
            roomService.StartTime = updatedRoomService.StartTime;
            roomService.EndTime = updatedRoomService.EndTime;

            _context.SaveChanges();
            return Ok(roomService);
        }

        [HttpDelete("roomservices/{id}")]
        public IActionResult DeleteRoomService(int id)
        {
            var roomService = _context.RoomServices.FirstOrDefault(rs => rs.ID == id);
            if (roomService == null)
            {
                return NotFound($"RoomService with ID {id} not found.");
            }
            _context.RoomServices.Remove(roomService);
            _context.SaveChanges();
            return NoContent();
        }
    }
}
