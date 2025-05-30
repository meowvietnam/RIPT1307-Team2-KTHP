using System.ComponentModel.DataAnnotations.Schema;
using Microsoft.AspNetCore.Mvc.ModelBinding.Validation; // Thêm dòng này
using System.Text.Json.Serialization; // Đảm bảo có dòng này

namespace RIPT1307_BTL.Common
{
    [Table("room_service")] // ép tên bảng là 'user'
    public class RoomService
    {
        public int RoomServiceID { get; set; }

        public int HistoryID { get; set; }
        public int RoomID { get; set; }
        public int ServiceID { get; set; }

        public int Quantity { get; set; }

        // Đánh dấu là không cần validate
        [ValidateNever] // <<-- THÊM DÒNG NÀY
        [JsonIgnore] // <<-- Đảm bảo có cái này
        public History? History { get; set; }
        [ValidateNever] // <<-- THÊM DÒNG NÀY
        [JsonIgnore] // Nếu RoomService có liên kết trực tiếp đến Room và tạo cycle, thì thêm vào
        public Room? Room { get; set; }

        [ValidateNever] // <<-- THÊM DÒNG NÀY nếu Service cũng bị lỗi tương tự
        public Service? Service { get; set; }
    }
    public class UpdateRoomServicesRequest
    {
        public int HistoryID { get; set; }
        public int RoomID { get; set; }
        public List<ServiceItemDto> Services { get; set; }
    }

    public class ServiceItemDto
    {
        public int ServiceID { get; set; }
        public int Quantity { get; set; } // <-- Đã sửa chính tả từ "quanity"
    }
    public class RoomServiceDto
    {
        public int RoomServiceID { get; set; }
        public int ServiceID { get; set; }
        public int Quantity { get; set; }
        public ServiceDto Service { get; set; } // Thay đổi từ Service entity sang ServiceDto
                                                // Bạn không cần HistoryID và RoomID ở đây nếu bạn muốn nó là một DTO đơn giản cho danh sách dịch vụ của một lịch sử
                                                // public int HistoryID { get; set; }
                                                // public int RoomID { get; set; }
    }
}
