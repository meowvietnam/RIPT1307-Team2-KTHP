using System.ComponentModel.DataAnnotations.Schema;

namespace RIPT1307_BTL.Common
{
    [Table("room_service")] // ép tên bảng là 'user'

    public class RoomService
    {
        public int ID { get; set; }                 // ID INT AUTO_INCREMENT PRIMARY KEY

        public int RoomID { get; set; }             // RoomID INT NOT NULL
        public Room Room { get; set; }               // Navigation property

        public int ServiceID { get; set; }          // ServiceID INT NOT NULL
        public Service Service { get; set; }         // Navigation property

        public int Quantity { get; set; } = 1;      // Quantity INT DEFAULT 1

        public DateTime StartTime { get; set; }     // StartTime DATETIME NOT NULL

        public DateTime? EndTime { get; set; }      // EndTime DATETIME NULL (nullable)
    }
}
