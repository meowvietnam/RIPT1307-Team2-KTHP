using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace RIPT1307_BTL.Common
{
    [Table("request")] // ép tên bảng là 'user'
    public class Request
    {
        [Key]
        public int RequestID { get; set; }
        public int UserID { get; set; }
        public string Title { get; set; }
        public string Content { get; set; }
        public string Status { get; set; }
        public User User { get; set; }
    }
    public class RequestDTO
    {
        public int UserID { get; set; }
        public string Title { get; set; }
        public string Content { get; set; }
    }
    public class UpdateRequestStatusDto
    {
        public string Status { get; set; }
    }
}
