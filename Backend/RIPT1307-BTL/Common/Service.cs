using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
namespace RIPT1307_BTL.Common
{
    [Table("service")] // ép tên bảng là 'user'

    public class Service
    {
        public int ServiceID { get; set; }          // Tương ứng với ServiceID INT AUTO_INCREMENT PRIMARY KEY
        public string ServiceName { get; set; }     // Tương ứng với ServiceName VARCHAR(100) NOT NULL
        public decimal Price { get; set; }           // Tương ứng với Price DECIMAL(10,2) NOT NULL
        public string ServiceType { get; set; }     // Tương ứng với ServiceType ENUM('Food', 'Drink', 'Room_Hourly', 'Room_Overnight') NOT NULL
    }
    public class ServiceDto
    {
        public int ServiceID { get; set; }
        public string ServiceName { get; set; }
        public decimal Price { get; set; }
        public string ServiceType { get; set; } // Nếu cần
    }
}
