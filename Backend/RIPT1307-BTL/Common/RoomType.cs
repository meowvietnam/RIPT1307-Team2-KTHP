using System.ComponentModel.DataAnnotations.Schema;

namespace RIPT1307_BTL.Common
{
    [Table("room_type")] // ép tên bảng là 'user'
    public class RoomType
    {
        public int RoomTypeID { get; set; }              // PRIMARY KEY
        public string TypeName { get; set; }             // Ví dụ: "Theo giờ", "Theo ngày" , "Qua đêm"
        public decimal BasePrice { get; set; }           // Giá cơ bản
        public int HourThreshold { get; set; }           // Ví dụ: nếu quá 3 giờ thì tính phụ thu
        public decimal OverchargePerHour { get; set; }   // Giá phụ thu mỗi giờ vượt ngưỡng

        public List<Room> Rooms { get; set; }            // Navigation property: 1 type -> nhiều phòng
    }
}

