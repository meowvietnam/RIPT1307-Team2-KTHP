using System.ComponentModel.DataAnnotations.Schema;

namespace RIPT1307_BTL.Common
{
    [Table("history")] // ép tên bảng là 'user'
    public class History
    {
        public int HistoryID { get; set; }

        public int RoomID { get; set; }
        public Room? Room { get; set; }

        public int UserID { get; set; }
        public User? User { get; set; }

        public List<RoomService>? RoomServices { get; set; }

        // Navigation property đến RoomType (chỉ khi bạn muốn load nó từ DB)
        // [NotMapped] // Nếu bạn KHÔNG muốn EF Core cố gắng ánh xạ nó vào cột DB


        // <<< CÁC THUỘC TÍNH SNAPSHOT CỦA ROOMTYPE PHẢI CÓ TRONG HISTORY MODEL >>>
        // Đây là bản sao của thông tin RoomType tại thời điểm check-out.

        public string? TypeName { get; set; } // <<-- THÊM DÒNG NÀY
        public int? HourThreshold { get; set; } // <<-- THÊM DÒNG NÀY
        public decimal? OverchargePerHour { get; set; } // <<-- THÊM DÒNG NÀY
        public decimal? BasePrice { get; set; } // <<-- THÊM DÒNG NÀY
        // <<< END CÁC THUỘC TÍNH SNAPSHOT >>>

        public decimal TotalPrice { get; set; }
        public bool IsCheckOut { get; set; }
        public string NumberPhoneCustomer { get; set; }
        public string NameCustomer { get; set; }
        public string IDCustomer { get; set; }

        public DateTime StartTime { get; set; }
        public DateTime? EndTime { get; set; }
    }
    public class HistoryDto
    {
        public int HistoryID { get; set; }
        public DateTime StartTime { get; set; }
        public DateTime? EndTime { get; set; }
        public decimal TotalPrice { get; set; }
        public string NumberPhoneCustomer { get; set; }
        public string NameCustomer { get; set; }
        public string IDCustomer { get; set; }
        public bool IsCheckOut { get; set; }

        public RoomDto Room { get; set; } // Chỉ bao gồm các trường cần thiết của Room
        public UserDto User { get; set; } // Chỉ bao gồm các trường cần thiết của User

        public ICollection<RoomServiceDto> RoomServices { get; set; }
    }
}
