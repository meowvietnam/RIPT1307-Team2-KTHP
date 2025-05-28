using System.ComponentModel.DataAnnotations.Schema;

namespace RIPT1307_BTL.Common
{
    [Table("room_service")] // ép tên bảng là 'user'

    public class RoomService
    {
        public int RoomServiceID { get; set; }

        public int RoomID { get; set; }          // Foreign key
        public Room Room { get; set; }           // Navigation property

        public int ServiceID { get; set; }
        public Service Service { get; set; }

        public int Quantity { get; set; } = 1;

        public int? HistoryID { get; set; }                 // Khóa ngoại đến History
        public History History { get; set; }                // Navigation đến History
    }
}
