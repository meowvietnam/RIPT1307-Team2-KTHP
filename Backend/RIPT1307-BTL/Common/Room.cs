using System.ComponentModel.DataAnnotations.Schema;

namespace RIPT1307_BTL.Common
{
    [Table("room")] // ép tên bảng là 'user'

    public class Room
    {
        public int RoomID { get; set; }              // RoomID INT AUTO_INCREMENT PRIMARY KEY
        public string RoomName { get; set; }         // RoomName VARCHAR(50) NOT NULL
        public string? BaseRoomType { get; set; }         // RoomType ENUM('Single', 'Double') NOT NULL
        public decimal Price { get; set; }            // Price DECIMAL(10,2) NOT NULL
        public string? Status { get; set; }            // Status ENUM('Available', 'In Use','Being Cleaned', 'Under Maintenance', 'Reserved') DEFAULT 'Available'
        public string? Description { get; set; }     // Description TEXT (có thể null)
        public int? RoomTypeID { get; set; } // <--- Đổi thành int?
        public RoomType? RoomType { get; set; } // <--- Đổi thành RoomType? nếu có thể null
                                                //   public List<RoomService> RoomServices { get; set; }

    }
    public static class RoomStatus
    {
        public const string Available = "Available"; // Hoặc "Available" nếu bạn muốn dùng tiếng Anh trong DB
        public const string InUse = "In Use";
        public const string BeingCleaned = "Being Cleaned";
        // ... thêm các trạng thái khác nếu có
    }
    public class StaffUpdateRoomStatusDto
    {
        public string Status { get; set; } // Chỉ nhận trạng thái
    }

    // Tạo file DTO mới (ví dụ: Models/DTOs/StaffUpdateRoomTypeDto.cs)
    public class StaffUpdateRoomTypeDto
    {
        public int? RoomTypeID { get; set; } // Chỉ nhận RoomTypeID
    }
    public class RoomDto
    {
        public int RoomID { get; set; }
        public string RoomName { get; set; }
        public RoomTypeDto RoomType { get; set; } // Chỉ bao gồm các trường cần thiết của RoomType
    }
}
