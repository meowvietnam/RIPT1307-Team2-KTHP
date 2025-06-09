using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using RIPT1307_BTL.Common;

namespace RIPT1307_BTL.Controllers
{
    [ApiController]
    [Route("admin")]
    public class AdminController : StaffController
    {
        public AdminController(AppDbContext context, ILogger<AdminController> logger)
        : base(context, logger) // <<-- TRUYỀN CẢ CONTEXT VÀ LOGGER LÊN LỚP CHA
        {
            // Thân hàm của constructor AdminController
            // Bạn có thể để trống nếu không có logic khởi tạo đặc biệt nào cho AdminController
        }
        [HttpPut("requests/{id}")]
        public IActionResult UpdateRequestStatus(int id, [FromBody] UpdateRequestStatusDto dto)
        {
            try
            {
                // Tìm Request theo RequestID, bao gồm User
                var request = _context.Requests
                    .Include(r => r.User)
                    .FirstOrDefault(r => r.RequestID == id);

                if (request == null)
                {
                    return NotFound("Request not found.");
                }

                // Cập nhật chỉ Status
                request.Status = dto.Status;
                _context.SaveChanges();

                // Tạo response tương tự GetRequests
                var response = new Request
                {
                    RequestID = request.RequestID,
                    Title = request.Title,
                    Content = request.Content,
                    Status = request.Status,
                    User = new User
                    {
                        UserID = request.User.UserID,
                        Username = request.User.Username,
                        FullName = request.User.FullName,
                        Email = request.User.Email,
                        Role = request.User.Role
                    }
                };

                return Ok(response);
            }
            catch (DbUpdateException ex)
            {
                return StatusCode(500, $"Database error: {ex.InnerException?.Message ?? ex.Message}");
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"An error occurred: {ex.Message}");
            }
        }

        // ---------------------- USERS ----------------------
        // GetUsers được chuyển sang StaffController và là public

        [HttpPost("users")]
     //   [Authorize(Roles = "admin")] // OK: Chỉ Admin mới có thể CreateUser
        public IActionResult CreateUser([FromBody] User user)
        {
            user.Role = "Staff"; // Mặc định tạo là Staff
            _context.Users.Add(user);
            _context.SaveChanges();
            return Ok(user);
        }

        [HttpPut("users/{id}")]
     //   [Authorize(Roles = "admin")] // OK: Chỉ Admin mới có thể UpdateUser
        public IActionResult UpdateUser(int id, [FromBody] User updatedUser)
        {
            var user = _context.Users.FirstOrDefault(u => u.UserID == id);
            if (user == null) return NotFound($"User with ID {id} not found.");

            user.FullName = updatedUser.FullName;
            user.Username = updatedUser.Username;
            // CÂN NHẮC: Không nên cập nhật mật khẩu trực tiếp như thế này từ API.
            // Nên có endpoint riêng hoặc xử lý hashing.
            user.Password = updatedUser.Password;
            user.Email = updatedUser.Email;
            user.Role = updatedUser.Role;

            _context.SaveChanges();
            return Ok(user);
        }

        [HttpDelete("users/{id}")]
    //    [Authorize(Roles = "admin")] // OK: Chỉ Admin mới có thể DeleteUser
        public IActionResult DeleteUser(int id)
        {
            var user = _context.Users.FirstOrDefault(u => u.UserID == id);
            if (user == null) return NotFound($"User with ID {id} not found.");

            _context.Users.Remove(user);
            _context.SaveChanges();
            return Ok(new { message = "User deleted" });
        }

        // ---------------------- ROOMS ----------------------
        // GetAllRooms được chuyển sang StaffController và là public

        [HttpPost("rooms")]
        //    [Authorize(Roles = "admin")] // OK: Chỉ Admin mới có thể CreateRoom
        public IActionResult CreateRoom([FromBody] Room room)
        {
            // Không cần kiểm tra ModelState.IsValid ở đây nếu bạn muốn bỏ qua validation mặc định
            // cho các trường không có [Required] hoặc validation attributes cụ thể.
            // Tuy nhiên, nếu có lỗi khác (ví dụ, BaseRoomType trống), nó vẫn có thể lỗi.
            // Tốt nhất vẫn nên giữ if (!ModelState.IsValid) và kiểm tra Response để xem lỗi cụ thể.

            // Gán RoomTypeID dựa trên giá trị từ frontend:
            // Nếu frontend gửi 0 (giá trị mặc định khi không chọn), chúng ta sẽ gán nó thành null.
            // Nếu frontend không gửi gì, nó sẽ là null.
            int? finalRoomTypeID = (room.RoomTypeID == 0) ? (int?)null : room.RoomTypeID;

            // Hoặc đơn giản hơn, nếu bạn muốn nó LUÔN LUÔN là null khi tạo mới từ form này:
            // int? finalRoomTypeID = null;

            var roomToCreate = new Room
            {
                RoomName = room.RoomName,
                BaseRoomType = room.BaseRoomType,
                Price = room.Price,
                Status = RoomStatus.Available, // Hoặc gán từ frontend nếu cần
                Description = room.Description,
                RoomTypeID = finalRoomTypeID // <--- Gán giá trị đã được xử lý
            };

            try
            {
                _context.Rooms.Add(roomToCreate);
                _context.SaveChanges();

                // Tải lại phòng cùng với RoomType. RoomType sẽ là null nếu RoomTypeID là null.
                var createdRoomWithNavProps = _context.Rooms
                                                    .Include(r => r.RoomType)
                                                    .FirstOrDefault(r => r.RoomID == roomToCreate.RoomID);

                return CreatedAtAction(nameof(GetRoomByID), new { id = createdRoomWithNavProps?.RoomID }, createdRoomWithNavProps);
            }
            catch (DbUpdateException ex)
            {
                Console.WriteLine($"Database error creating room: {ex.InnerException?.Message ?? ex.Message}");
                return StatusCode(500, $"Lỗi cơ sở dữ liệu khi tạo phòng: {ex.InnerException?.Message ?? "Không xác định"}");
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Error creating room: {ex.Message}");
                return StatusCode(500, $"Đã xảy ra lỗi không xác định khi tạo phòng: {ex.Message}");
            }

        }
        [HttpPut("rooms/{id}")]
        // [Authorize(Roles = "admin")]
        public IActionResult UpdateRoom(int id, [FromBody] Room updatedRoom)
        {
            var room = _context.Rooms.FirstOrDefault(r => r.RoomID == id);
            if (room == null) return NotFound($"Room with ID {id} not found.");

            room.RoomName = updatedRoom.RoomName;
            room.RoomType = updatedRoom.RoomType;
            room.BaseRoomType = updatedRoom.BaseRoomType;
            room.Price = updatedRoom.Price;
            room.Status = updatedRoom.Status;
            room.Description = updatedRoom.Description;

            _context.SaveChanges();
            return Ok(room);
        }

        [HttpDelete("rooms/{id}")]
      //  [Authorize(Roles = "admin")] // OK: Chỉ Admin mới có thể DeleteRoom
        public IActionResult DeleteRoom(int id)
        {
            var room = _context.Rooms.FirstOrDefault(r => r.RoomID == id);
            if (room == null) return NotFound(new { message = "Room not found" });

            _context.Rooms.Remove(room);
            _context.SaveChanges();
            return Ok(new { message = "Room deleted successfully" });
        }

        // ---------------------- SERVICES ----------------------
        // GetServices và GetServiceById được chuyển sang StaffController và là public

        [HttpPost("services")]
       // [Authorize(Roles = "admin")] // OK: Chỉ Admin mới có thể CreateService
        public IActionResult CreateService([FromBody] Service service)
        {
            if (!ModelState.IsValid) return BadRequest(ModelState);

            _context.Services.Add(service);
            _context.SaveChanges();
            return CreatedAtAction(nameof(StaffController.GetServiceById), "Staff", new { id = service.ServiceID }, service);
            // Lưu ý: Gọi nameof(StaffController.GetServiceById) và chỉ định Controller "Staff" nếu GetServiceById nằm trong StaffController
        }

        [HttpPut("services/{id}")]
      //  [Authorize(Roles = "admin")] // OK: Chỉ Admin mới có thể UpdateService
        public IActionResult UpdateService(int id, [FromBody] Service updatedService)
        {
            if (!ModelState.IsValid) return BadRequest(ModelState);

            var service = _context.Services.FirstOrDefault(s => s.ServiceID == id);
            if (service == null) return NotFound($"Service with ID {id} not found.");

            service.ServiceName = updatedService.ServiceName;
            service.Price = updatedService.Price;
            service.ServiceType = updatedService.ServiceType;

            _context.SaveChanges();
            return Ok(service);
        }

        [HttpDelete("services/{id}")]
       // [Authorize(Roles = "admin")] // OK: Chỉ Admin mới có thể DeleteService
        public IActionResult DeleteService(int id)
        {
            var service = _context.Services.FirstOrDefault(s => s.ServiceID == id);
            if (service == null) return NotFound($"Service with ID {id} not found.");

            _context.Services.Remove(service);
            _context.SaveChanges();
            return NoContent();
        }

        // ---------------------- ROOM TYPES ----------------------
        // GetRoomTypes và GetRoomTypeById được chuyển sang StaffController và là public

        [HttpPost("roomtypes")]
     //   [Authorize(Roles = "admin")]
        public IActionResult CreateRoomType([FromBody] RoomType roomType)
        {
            if (!ModelState.IsValid) return BadRequest(ModelState);

            _context.RoomTypes.Add(roomType);
            _context.SaveChanges();
            // CHỈNH SỬA Ở ĐÂY: Không cần dùng Name nữa, chỉ dùng tên phương thức
            return CreatedAtAction(nameof(StaffController.GetRoomTypeById), "Staff", new { id = roomType.RoomTypeID }, roomType);
        }

        [HttpPut("roomtypes/{id}")]
       // [Authorize(Roles = "admin")] // OK: Chỉ Admin mới có thể UpdateRoomType
        public IActionResult UpdateRoomType(int id, [FromBody] RoomType updatedRoomType)
        {
            if (!ModelState.IsValid) return BadRequest(ModelState);

            var roomType = _context.RoomTypes.FirstOrDefault(rt => rt.RoomTypeID == id);
            if (roomType == null) return NotFound($"RoomType with ID {id} not found.");

            roomType.TypeName = updatedRoomType.TypeName;
            roomType.HourThreshold = updatedRoomType.HourThreshold;
            roomType.OverchargePerHour = updatedRoomType.OverchargePerHour;
            roomType.BasePrice = updatedRoomType.BasePrice;

            _context.SaveChanges();
            return Ok(roomType);
        }

        [HttpDelete("roomtypes/{id}")]
   //     [Authorize(Roles = "admin")] // OK: Chỉ Admin mới có thể DeleteRoomType
        public IActionResult DeleteRoomType(int id)
        {
            var roomType = _context.RoomTypes.FirstOrDefault(rt => rt.RoomTypeID == id);
            if (roomType == null) return NotFound($"RoomType with ID {id} not found.");

            _context.RoomTypes.Remove(roomType);
            _context.SaveChanges();
            return NoContent();
        }
        // ---------------------- HISTORIES ----------------------



        [HttpGet("users")]
        //  [Authorize(Roles = "staff,admin")] // CHỈNH SỬA: Yêu cầu quyền 'staff' hoặc 'admin'
        public IActionResult GetUsers()
        {
            var users = _context.Users.ToList();
            return Ok(users);
        }


        [HttpDelete("histories/{id}")]
        public IActionResult DeleteHistory(int id)
        {
            var history = _context.Histories.FirstOrDefault(h => h.HistoryID == id);
            if (history == null) return NotFound($"History with ID {id} not found.");

            _context.Histories.Remove(history);
            _context.SaveChanges();
            return Ok(new { message = "History deleted successfully" });
        }
    }
}