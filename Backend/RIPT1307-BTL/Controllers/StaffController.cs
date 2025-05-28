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
        [HttpGet("rooms")]
        public IActionResult GetAllRooms()
        {
            var rooms = _context.Rooms
                .Include(r => r.RoomServices)
                    .ThenInclude(rs => rs.Service)
                .ToList();

            return Ok(rooms);
        }
        [HttpPost("roomservices/update")]
        public IActionResult AddOrUpdateRoomService([FromBody] RoomService input)
        {
            // Tìm dịch vụ đã tồn tại trong phòng (nếu có)
            var existing = _context.RoomServices
                .FirstOrDefault(rs => rs.RoomID == input.RoomID && rs.ServiceID == input.ServiceID );

            if (existing != null)
            {
                // Nếu đã tồn tại dịch vụ đó trong phòng, tăng số lượng
                existing.Quantity += input.Quantity > 0 ? input.Quantity : 1;
            }
            else
            {
                // Nếu chưa có thì thêm mới
                input.Quantity = input.Quantity > 0 ? input.Quantity : 1;
                //input.IsCheckOut = false;
                _context.RoomServices.Add(input);
            }

            _context.SaveChanges();
            return Ok("Service updated successfully.");
        }
        [HttpDelete("roomservices")]
        public IActionResult DeleteRoomService(int roomId, int serviceId)
        {
            var roomService = _context.RoomServices
                .FirstOrDefault(rs => rs.RoomID == roomId && rs.ServiceID == serviceId);

            if (roomService == null)
            {
                return NotFound("Dịch vụ không tồn tại trong phòng hoặc đã được checkout.");
            }

            _context.RoomServices.Remove(roomService);
            _context.SaveChanges();
            return Ok("Đã xóa dịch vụ khỏi phòng.");
        }
    }
}
