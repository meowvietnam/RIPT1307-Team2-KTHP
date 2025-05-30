using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using RIPT1307_BTL.Common;
using Microsoft.Extensions.Logging; // Thêm namespace này

namespace RIPT1307_BTL.Controllers
{
    [ApiController]
    [Route("staff")]
    public class StaffController : ControllerBase
    {
        protected readonly AppDbContext _context;
        protected readonly ILogger<StaffController> _logger; // Khai báo ILogger

        // CHỈNH SỬA: Thêm ILogger vào constructor
        public StaffController(AppDbContext context, ILogger<StaffController> logger)
        {
            _context = context;
            _logger = logger; // Khởi tạo ILogger
        }

        // ---------------------- SERVICES ----------------------
        [HttpGet("services")]
        // [Authorize(Roles = "staff,admin")] // CHỈNH SỬA: Yêu cầu quyền 'staff' hoặc 'admin'
        public IActionResult GetServices()
        {
            var services = _context.Services.ToList();
            return Ok(services);
        }

        // [Authorize(Roles = "staff,admin")] // CHỈNH SỬA: Yêu cầu quyền 'staff' hoặc 'admin'
        [HttpGet("services/{id}")]
        public IActionResult GetServiceById(int id)
        {
            var service = _context.Services.FirstOrDefault(s => s.ServiceID == id);
            if (service == null) return NotFound($"Service with ID {id} not found.");
            return Ok(service);
        }
        // ---------------------- USERS ----------------------
        [HttpGet("usersdto")] // Endpoint để lấy User DTO
        // [Authorize(Roles = "staff,admin")] // CHỈNH SỬA: Yêu cầu quyền 'staff' hoặc 'admin'
        public async Task<ActionResult<IEnumerable<UserDto>>> GetUsersDTO()
        {
            // Lọc ra những người dùng có vai trò KHÔNG PHẢI là "Admin"
            // Lưu ý: Đảm bảo chuỗi "Admin" khớp chính xác với giá trị trong DB (ví dụ: Admin, admin, ADMINISTRATOR...)
            var users = await _context.Users
                                        .Where(u => u.Role != "Admin") // <-- THÊM DÒNG NÀY ĐỂ LỌC
                                        .Select(u => new UserDto
                                        {
                                            UserID = u.UserID,
                                            FullName = u.FullName,
                                            //Role = u.Role // <-- BỎ COMMENT DÒNG NÀY ĐỂ BAO GỒM ROLE TRONG DTO
                                        })
                                        .ToListAsync();

            if (!users.Any())
            {
                return NotFound(new { message = "Không tìm thấy người dùng nào không phải Admin." });
            }

            return Ok(users);
        }

        // RoomService Endpoints
        [HttpGet("rooms")]
        // [Authorize(Roles = "staff,admin")] // CHỈNH SỬA: Yêu cầu quyền 'staff' hoặc 'admin'
        public IActionResult GetAllRooms()
        {
            var rooms = _context.Rooms
                                        .Include(r => r.RoomType) // <--- DÒNG NÀY LÀ MẤU CHỐT
                                        .ToList();
            return Ok(rooms);
        }

        [HttpPut("rooms/{id}/status")] // Rõ ràng là cập nhật trạng thái
        // [Authorize(Roles = "Admin,Staff")] // Chỉ Staff và Admin mới được phép
        public async Task<IActionResult> UpdateRoomStatus(int id, [FromBody] StaffUpdateRoomStatusDto dto)
        {
            var room = await _context.Rooms.FirstOrDefaultAsync(r => r.RoomID == id);
            if (room == null) return NotFound($"Room with ID {id} not found.");

            room.Status = dto.Status;

            await _context.SaveChangesAsync();
            // Đặt breakpoint ở ĐÂY
            return Ok(room); // Dòng này là nơi serialize diễn ra
        }


        [HttpPut("rooms/{id}/roomType")]
        // [Authorize(Roles = "Admin,Staff")]
        public async Task<IActionResult> UpdateRoomType(int id, [FromBody] StaffUpdateRoomTypeDto dto)
        {
            var room = await _context.Rooms.FirstOrDefaultAsync(r => r.RoomID == id);
            if (room == null)
            {
                return NotFound(new { message = $"Room with ID {id} not found." }); // Trả về JSON lỗi NotFound
            }

            // Kiểm tra xem RoomTypeID có tồn tại không (nếu RoomTypeID.HasValue)
            if (dto.RoomTypeID.HasValue && !await _context.RoomTypes.AnyAsync(rt => rt.RoomTypeID == dto.RoomTypeID.Value))
            {
                return BadRequest(new { message = "Invalid RoomTypeID." }); // Trả về JSON lỗi BadRequest
            }

            room.RoomTypeID = dto.RoomTypeID; // Cập nhật RoomTypeID

            try
            {
                await _context.SaveChangesAsync(); // Lưu thay đổi RoomTypeID

                // QUAN TRỌNG: Tải lại đối tượng Room với RoomType đã được Include đầy đủ
                var updatedRoomWithIncludes = await _context.Rooms
                    .Include(r => r.RoomType) // Đảm bảo RoomType được tải cùng
                    .FirstOrDefaultAsync(r => r.RoomID == id);

                // Đảm bảo updatedRoomWithIncludes không null sau khi tải lại
                if (updatedRoomWithIncludes == null)
                {
                    // Điều này hiếm khi xảy ra nếu room không null ở trên, nhưng là một kiểm tra an toàn.
                    return NotFound(new { message = "Room not found after update (internal error)." });
                }

                // Trả về đối tượng phòng đã cập nhật với RoomType đã được tải đầy đủ
                return Ok(updatedRoomWithIncludes);
            }
            catch (Exception ex)
            {
                Console.Error.WriteLine($"Error updating room type for room {id}: {ex.Message}");
                if (ex.InnerException != null)
                {
                    Console.Error.WriteLine($"Inner Exception: {ex.InnerException.Message}");
                }
                return StatusCode(500, new { message = "Internal server error: Failed to update room type.", details = ex.Message });
            }
        }
        [HttpGet("rooms/{id}")]
        // [Authorize(Roles = "staff,admin")] // CHỈNH SỬA: Yêu cầu quyền 'staff' hoặc 'admin'
        public IActionResult GetRoomByID(int id)
        {
            var room = _context.Rooms.FirstOrDefault(s => s.RoomID == id);
            if (room == null) return NotFound($"Service with ID {id} not found.");
            return Ok(room);
        }
        [HttpPost("roomservices")]
        public async Task<IActionResult> AddRoomServices([FromBody] UpdateRoomServicesRequest request)
        {
            if (request == null || !request.Services.Any())
            {
                return BadRequest("Yêu cầu không hợp lệ hoặc danh sách dịch vụ trống.");
            }

            Console.WriteLine($"[BACKEND DEBUG]: Xử lý request cho HistoryID: {request.HistoryID}, RoomID: {request.RoomID}");

            // Cần Include các thông tin cần thiết nếu bạn muốn trả về toàn bộ HistoryDto
            // Nhưng vì bạn chỉ thêm RoomService, không cần Include nhiều ở đây
            var history = await _context.Histories
                .FirstOrDefaultAsync(h => h.HistoryID == request.HistoryID && h.RoomID == request.RoomID);

            if (history == null)
            {
                Console.WriteLine($"[BACKEND DEBUG]: Không tìm thấy lịch sử với HistoryID {request.HistoryID} và RoomID {request.RoomID}.");
                return NotFound($"Không tìm thấy lịch sử với HistoryID {request.HistoryID} và RoomID {request.RoomID}.");
            }

            foreach (var serviceItem in request.Services)
            {
                Console.WriteLine($"[BACKEND DEBUG]: Đang xử lý ServiceID: {serviceItem.ServiceID}, Quantity: {serviceItem.Quantity}");

                var existingRoomService = await _context.RoomServices
                    .FirstOrDefaultAsync(rs =>
                        rs.HistoryID == request.HistoryID &&
                        rs.ServiceID == serviceItem.ServiceID);

                if (existingRoomService != null)
                {
                    existingRoomService.Quantity += serviceItem.Quantity > 0 ? serviceItem.Quantity : 1;
                    Console.WriteLine($"[BACKEND DEBUG]: Đã cập nhật Quantity cho RoomService {existingRoomService.RoomServiceID}");
                }
                else
                {
                    var newRoomService = new RoomService
                    {
                        RoomID = request.RoomID, // Đảm bảo gán RoomID
                        ServiceID = serviceItem.ServiceID,
                        Quantity = serviceItem.Quantity > 0 ? serviceItem.Quantity : 1,
                        HistoryID = request.HistoryID
                        // StartTime = serviceItem.StartTime // Thêm nếu bạn muốn lưu StartTime vào RoomService
                    };
                    _context.RoomServices.Add(newRoomService);
                    Console.WriteLine($"[BACKEND DEBUG]: Đã thêm mới RoomService: RoomID={newRoomService.RoomID}, ServiceID={newRoomService.ServiceID}");
                }
            }

            try
            {
                await _context.SaveChangesAsync();
                Console.WriteLine("[BACKEND DEBUG]: Thay đổi đã được lưu thành công vào DB.");

                // BẮT BUỘC phải tải lại toàn bộ thông tin History cần thiết
                // để có thể ánh xạ sang HistoryDto đầy đủ
                var updatedHistory = await _context.Histories
                    .Include(h => h.RoomServices)
                        .ThenInclude(rs => rs.Service)
                    .Include(h => h.User)
                    .Include(h => h.Room)
                        .ThenInclude(r => r.RoomType)
                    .FirstOrDefaultAsync(h => h.HistoryID == request.HistoryID);

                if (updatedHistory == null)
                {
                    Console.Error.WriteLine($"[BACKEND ERROR]: Lỗi nội bộ: Không thể tìm thấy lịch sử {request.HistoryID} sau khi cập nhật.");
                    return StatusCode(500, new { message = "Lỗi nội bộ: Không thể tìm thấy lịch sử sau khi cập nhật." });
                }

                // Ánh xạ updatedHistory (Entity) sang HistoryDto (DTO)
                var historyDto = new HistoryDto
                {
                    HistoryID = updatedHistory.HistoryID,
                    StartTime = updatedHistory.StartTime,
                    EndTime = updatedHistory.EndTime,
                    TotalPrice = updatedHistory.TotalPrice,

                    // THÊM CÁC THUỘC TÍNH CUSTOMER VÀ ISCHECKOUT VÀO ĐÂY:
                    NameCustomer = updatedHistory.NameCustomer,
                    NumberPhoneCustomer = updatedHistory.NumberPhoneCustomer,
                    IDCustomer = updatedHistory.IDCustomer,
                    IsCheckOut = updatedHistory.IsCheckOut, // Đảm bảo tên thuộc tính khớp với DTO

                    Room = updatedHistory.Room != null ? new RoomDto
                    {
                        RoomID = updatedHistory.Room.RoomID,
                        RoomName = updatedHistory.Room.RoomName,
                        RoomType = updatedHistory.Room.RoomType != null ? new RoomTypeDto
                        {
                            RoomTypeID = updatedHistory.Room.RoomType.RoomTypeID,
                            TypeName = updatedHistory.Room.RoomType.TypeName,
                            OverchargePerHour = updatedHistory.Room.RoomType.OverchargePerHour
                        } : null
                    } : null,

                    User = updatedHistory.User != null ? new UserDto
                    {
                        UserID = updatedHistory.User.UserID,
                        FullName = updatedHistory.User.FullName,
                        // KHÔNG BAO GỒM PASSWORD HOẶC CÁC THÔNG TIN NHẠY CẢM KHÁC
                    } : null,

                    RoomServices = updatedHistory.RoomServices.Select(rs => new RoomServiceDto
                    {
                        RoomServiceID = rs.RoomServiceID,
                        ServiceID = rs.ServiceID,
                        Quantity = rs.Quantity,
                        // StartTime = rs.StartTime, // Thêm nếu RoomServiceDto có StartTime
                        Service = rs.Service != null ? new ServiceDto
                        {
                            ServiceID = rs.Service.ServiceID,
                            ServiceName = rs.Service.ServiceName,
                            Price = rs.Service.Price
                        } : null
                    }).ToList()
                };

                // Trả về DTO
                return Ok(historyDto);
            }
            catch (DbUpdateConcurrencyException ex)
            {
                Console.Error.WriteLine($"[BACKEND ERROR]: Lỗi đồng thời khi thêm dịch vụ: {ex.Message}");
                return Conflict("Dữ liệu đã được thay đổi bởi người khác. Vui lòng thử lại.");
            }
            catch (DbUpdateException ex)
            {
                Console.Error.WriteLine($"[BACKEND ERROR]: Lỗi cập nhật DB khi thêm dịch vụ: {ex.Message}");
                if (ex.InnerException != null) Console.Error.WriteLine($"Inner Exception: {ex.InnerException.Message}");
                Console.Error.WriteLine(ex.StackTrace);
                return StatusCode(500, "Lỗi khi lưu dữ liệu vào cơ sở dữ liệu.");
            }
            catch (Exception ex)
            {
                Console.Error.WriteLine($"[BACKEND ERROR]: Lỗi không mong muốn khi thêm dịch vụ: {ex.Message}");
                Console.Error.WriteLine(ex.StackTrace);
                return StatusCode(500, "Đã xảy ra lỗi không mong muốn.");
            }
        }
        [HttpDelete("roomservices")]
        // [Authorize(Roles = "staff,admin")] // CHỈNH SỬA: Yêu cầu quyền 'staff' hoặc 'admin'
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
        // ---------------------- ROOM TYPES ----------------------
        [HttpGet("roomtypes")]
        // [Authorize(Roles = "staff,admin")] // CHỈNH SỬA: Yêu cầu quyền 'staff' hoặc 'admin'
        public IActionResult GetRoomTypes()
        {
            var roomTypes = _context.RoomTypes.ToList();
            return Ok(roomTypes);
        }


        // LOẠI BỎ Name = "GetRoomTypeById"
        [HttpGet("roomtypes/{id}")]
        // [Authorize(Roles = "staff,admin")]
        public IActionResult GetRoomTypeById(int id) // Vẫn giữ tên phương thức
        {
            var roomType = _context.RoomTypes.FirstOrDefault(rt => rt.RoomTypeID == id);
            if (roomType == null) return NotFound($"RoomType with ID {id} not found.");
            return Ok(roomType);
        }
        // ---------------------- HISTORIES ----------------------
        [HttpPost("histories")]
        public IActionResult CreateHistory([FromBody] History history)
        {
            // Entity Framework Core sẽ tự động thêm các RoomService liên quan
            // nếu chúng được đính kèm trong đối tượng history và có trạng thái Added.
            _context.Histories.Add(history);
            _context.SaveChanges();

            // Sau khi lưu, tải lại đối tượng với các navigation properties cần thiết
            var createdHistoryWithIncludes = _context.Histories
                .Include(h => h.Room)
                    .ThenInclude(r => r.RoomType)
                .Include(h => h.User)
                .Include(h => h.RoomServices)
                    .ThenInclude(rs => rs.Service)
                .FirstOrDefault(h => h.HistoryID == history.HistoryID);

            if (createdHistoryWithIncludes == null)
            {
                // Trường hợp này rất hiếm sau khi SaveChanges thành công, nhưng nên xử lý
                return StatusCode(500, "Lỗi khi tạo lịch sử: Không thể tải lại đối tượng đã tạo.");
            }

            return CreatedAtAction(nameof(GetHistoryById), new { id = createdHistoryWithIncludes.HistoryID }, createdHistoryWithIncludes);
        }

        [HttpGet("histories")]
        public IActionResult GetAllHistories()
        {
            var histories = _context.Histories
                .Include(h => h.Room)
                    .ThenInclude(r => r.RoomType)
                .Include(h => h.User)
                // XÓA CÁC DÒNG NÀY:
                // .Include(h => h.IDCustomer)
                // .Include(h => h.IsCheckOut)
                // .Include(h => h.NumberPhoneCustomer)
                // .Include(h => h.NameCustomer)
                .Include(h => h.RoomServices)
                    .ThenInclude(rs => rs.Service)
                .ToList(); // Sử dụng ToList() vì bạn muốn trả về tất cả

            return Ok(histories);
        }

        [HttpGet("histories/{id}")]
        public IActionResult GetHistoryById(int id)
        {
            var history = _context.Histories
                .Include(h => h.Room)
                    .ThenInclude(r => r.RoomType)
                .Include(h => h.User)
                .Include(h => h.RoomServices)
                    .ThenInclude(rs => rs.Service)
                // XÓA DÒNG NÀY:
                // .Include(h => h.RoomType) // Dòng này cũng sai vì RoomType đã được ThenInclude từ Room
                .FirstOrDefault(h => h.HistoryID == id);

            if (history == null) return NotFound($"History with ID {id} not found.");

            return Ok(history);
        }

        [HttpGet("histories/room/{id}")] // Route cho Action: /admin/histories/room/{id}
        public async Task<IActionResult> GetHistoryByRoomId(int id)
        {
            var roomExists = await _context.Rooms.AnyAsync(r => r.RoomID == id);
            if (!roomExists)
            {
                return NotFound($"Room with ID {id} not found.");
            }

            var histories = await _context.Histories
                .Include(h => h.Room)
                    .ThenInclude(r => r.RoomType)
                .Include(h => h.User)
                // XÓA CÁC DÒNG NÀY:
                // .Include(h => h.IDCustomer)
                // .Include(h => h.IsCheckOut)
                // .Include(h => h.NumberPhoneCustomer)
                // .Include(h => h.NameCustomer)
                .Include(h => h.RoomServices)
                    .ThenInclude(rs => rs.Service)
                .Where(h => h.RoomID == id)
                .OrderByDescending(h => h.StartTime)
                .ToListAsync();

            // Đảm bảo bạn có các DTO (HistoryDto, RoomDto, UserDto, RoomServiceDto, ServiceDto, RoomTypeDto)
            // khớp với cấu trúc JSON mà frontend mong đợi.
            // Nếu các thuộc tính scalar như NameCustomer, NumberPhoneCustomer, IDCustomer, IsCheckOut
            // đã nằm trực tiếp trong History model C# của bạn, chúng sẽ tự động được ánh xạ vào DTO.
            if (!histories.Any())
            {
                return Ok(new List<HistoryDto>()); // Trả về danh sách DTO rỗng nếu không có lịch sử
            }

            var historyDtos = histories.Select(h => new HistoryDto
            {
                HistoryID = h.HistoryID,
                StartTime = h.StartTime,
                EndTime = h.EndTime,
                TotalPrice = h.TotalPrice,
                // Các thuộc tính scalar này đã có sẵn trong 'h', không cần Include riêng
                NameCustomer = h.NameCustomer,
                NumberPhoneCustomer = h.NumberPhoneCustomer,
                IDCustomer = h.IDCustomer,
                IsCheckOut = h.IsCheckOut, // Đảm bảo tên thuộc tính khớp với DTO (IsCheckedOut vs IsCheckOut)
                Room = h.Room != null ? new RoomDto
                {
                    RoomID = h.Room.RoomID,
                    RoomName = h.Room.RoomName,
                    RoomType = h.Room.RoomType != null ? new RoomTypeDto
                    {
                        RoomTypeID = h.Room.RoomType.RoomTypeID,
                        TypeName = h.Room.RoomType.TypeName,
                        OverchargePerHour = h.Room.RoomType.OverchargePerHour
                    } : null
                } : null,
                User = h.User != null ? new UserDto
                {
                    UserID = h.User.UserID,
                    FullName = h.User.FullName,
                } : null,
                RoomServices = h.RoomServices.Select(rs => new RoomServiceDto
                {
                    RoomServiceID = rs.RoomServiceID,
                    ServiceID = rs.ServiceID,
                    Quantity = rs.Quantity,
                    // StartTime = rs.StartTime, // Thêm nếu RoomServiceDto có StartTime
                    Service = rs.Service != null ? new ServiceDto
                    {
                        ServiceID = rs.Service.ServiceID,
                        ServiceName = rs.Service.ServiceName,
                        Price = rs.Service.Price
                    } : null
                }).ToList()
            }).ToList();

            return Ok(historyDtos); // Trả về danh sách DTO
        }



        [HttpPut("histories/{id}")]
        public IActionResult UpdateHistory(int id, [FromBody] History updated)
        {
            if (!ModelState.IsValid)
            {
                _logger.LogError("Model state is invalid for UpdateHistory request.");
                foreach (var modelStateEntry in ModelState.Values)
                {
                    foreach (var error in modelStateEntry.Errors)
                    {
                        _logger.LogError($"Model Error: {error.ErrorMessage}");
                        if (error.Exception != null)
                        {
                            _logger.LogError($"  Exception: {error.Exception.Message}");
                        }
                    }
                }
                return BadRequest(ModelState);
            }

            var history = _context.Histories
                .Include(h => h.Room)
                    .ThenInclude(r => r.RoomType)
                .Include(h => h.User)
                .Include(h => h.RoomServices)
                    .ThenInclude(rs => rs.Service)
                .FirstOrDefault(h => h.HistoryID == id);

            if (history == null)
            {
                _logger.LogWarning($"History with ID {id} not found for update.");
                return NotFound($"History with ID {id} not found.");
            }

            history.NameCustomer = updated.NameCustomer;
            history.NumberPhoneCustomer = updated.NumberPhoneCustomer;
            history.IDCustomer = updated.IDCustomer;
            history.StartTime = updated.StartTime;
            history.EndTime = updated.EndTime;
            history.IsCheckOut = updated.IsCheckOut;
            history.TotalPrice = updated.TotalPrice;


            history.TypeName = updated.TypeName;
            history.HourThreshold = updated.HourThreshold;
            history.OverchargePerHour = updated.OverchargePerHour;
            history.BasePrice = updated.BasePrice;


            history.RoomID = updated.RoomID;
            history.UserID = updated.UserID;

            var incomingRoomServices = updated.RoomServices?.ToList() ?? new List<RoomService>();
            var existingRoomServices = history.RoomServices.ToList();

            foreach (var existingRs in existingRoomServices)
            {
                if (!incomingRoomServices.Any(irs => irs.RoomServiceID == existingRs.RoomServiceID && existingRs.RoomServiceID != 0))
                {
                    _context.RoomServices.Remove(existingRs);
                    _logger.LogInformation($"Removed RoomService {existingRs.RoomServiceID} from History {id}.");
                }
            }

            foreach (var incomingRs in incomingRoomServices)
            {
                var existingRs = existingRoomServices.FirstOrDefault(ers => ers.RoomServiceID == incomingRs.RoomServiceID && incomingRs.RoomServiceID != 0);

                if (existingRs == null)
                {
                    incomingRs.HistoryID = history.HistoryID;
                    incomingRs.RoomID = history.RoomID;
                    _context.RoomServices.Add(incomingRs);

                    if (incomingRs.Service != null && incomingRs.Service.ServiceID != 0)
                    {
                        _context.Entry(incomingRs.Service).State = EntityState.Unchanged;
                    }
                    _logger.LogInformation($"Added new RoomService for History {id}: ServiceID {incomingRs.ServiceID}, Quantity {incomingRs.Quantity}.");
                }
                else
                {
                    existingRs.ServiceID = incomingRs.ServiceID;
                    existingRs.Quantity = incomingRs.Quantity;

                    if (incomingRs.Service != null && incomingRs.Service.ServiceID != 0)
                    {
                        var serviceToUpdate = _context.Services.Find(incomingRs.Service.ServiceID);
                        if (serviceToUpdate != null)
                        {
                            _context.Entry(serviceToUpdate).CurrentValues.SetValues(incomingRs.Service);
                            _context.Entry(serviceToUpdate).State = EntityState.Modified;
                        }
                        else
                        {
                            _logger.LogWarning($"Service with ID {incomingRs.Service.ServiceID} not found for update in RoomService {incomingRs.RoomServiceID}.");
                        }
                    }
                    _logger.LogInformation($"Updated RoomService {existingRs.RoomServiceID} for History {id}: Quantity {incomingRs.Quantity}.");
                }
            }

            try
            {
                _context.SaveChanges();
                _logger.LogInformation($"History {id} updated successfully.");
            }
            catch (DbUpdateException ex)
            {
                _logger.LogError(ex, $"DbUpdateException when updating history {id}: {ex.Message}");
                if (ex.InnerException != null)
                {
                    _logger.LogError(ex.InnerException, $"Inner Exception: {ex.InnerException.Message}");
                }
                return StatusCode(500, "Lỗi khi cập nhật dữ liệu vào cơ sở dữ liệu. Vui lòng kiểm tra lại dữ liệu gửi đi và cấu hình backend.");
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, $"Unhandled exception when updating history {id}: {ex.Message}");
                return StatusCode(500, "Đã xảy ra lỗi không mong muốn khi cập nhật lịch sử.");
            }

            var updatedHistoryWithIncludes = _context.Histories
                .Include(h => h.Room)
                    .ThenInclude(r => r.RoomType)
                .Include(h => h.User)
                .Include(h => h.RoomServices)
                    .ThenInclude(rs => rs.Service)
                .FirstOrDefault(h => h.HistoryID == id);

            if (updatedHistoryWithIncludes == null)
            {
                _logger.LogError($"Internal Error: History with ID {id} not found after successful update.");
                return StatusCode(500, $"Internal Error: History with ID {id} not found after update.");
            }

            return Ok(updatedHistoryWithIncludes);
        }
    }
}