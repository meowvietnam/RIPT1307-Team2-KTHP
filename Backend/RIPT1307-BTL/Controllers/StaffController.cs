using Microsoft.AspNetCore.Mvc;
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


        [HttpGet("roomservices")]
        public IActionResult GetRoomService()
        {
            var roomService = _context.RoomServices.ToList();
            return Ok(roomService);
        }

        [HttpPost("roomservices")]
        public IActionResult CreateRoomService([FromBody] RoomService roomService)
        {
            _context.RoomServices.Add(roomService);
            _context.SaveChanges();
            return Ok(roomService);
        }
    }
}
