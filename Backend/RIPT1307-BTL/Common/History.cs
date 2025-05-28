using System.ComponentModel.DataAnnotations.Schema;

namespace RIPT1307_BTL.Common
{
    [Table("history")] // ép tên bảng là 'user'
    public class History
    {
        public int HistoryID { get; set; }                 // PRIMARY KEY

        public int RoomID { get; set; }                    // ID của phòng được sử dụng
        public Room Room { get; set; }                     // Navigation tới phòng

        public int UserID { get; set; }                    // Nhân viên trực
        public User User { get; set; }                     // Navigation tới nhân viên

        public List<RoomService> RoomServices { get; set; }

        public float TotalPrice { get; set; }

        public DateTime StartTime { get; set; }
        public DateTime? EndTime { get; set; }
    }
}
