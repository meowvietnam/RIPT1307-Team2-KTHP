using System.ComponentModel.DataAnnotations.Schema;

namespace RIPT1307_BTL.Common
{
    [Table("room")] // ép tên bảng là 'user'

    public class Room
    {
        public int RoomID { get; set; }              // RoomID INT AUTO_INCREMENT PRIMARY KEY
        public string RoomName { get; set; }         // RoomName VARCHAR(50) NOT NULL
        public string RoomType { get; set; }         // RoomType ENUM('Single', 'Double') NOT NULL
        public decimal Price { get; set; }            // Price DECIMAL(10,2) NOT NULL
        public string Status { get; set; }            // Status ENUM('Available', 'In Use','Being Cleaned', 'Under Maintenance', 'Reserved') DEFAULT 'Available'
        public string? Description { get; set; }     // Description TEXT (có thể null)
        public int RoomTypeID { get; set; }              // Foreign key

        public List<RoomService> RoomServices { get; set; }

    }
}
