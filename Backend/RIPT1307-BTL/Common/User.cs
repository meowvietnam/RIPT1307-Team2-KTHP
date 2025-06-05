using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

[Table("user")] // ép tên bảng là 'user'
public class User
{
    [Key]
    public int UserID { get; set; }
    public string Username { get; set; }
    public string Password { get; set; }
    public string FullName { get; set; }
    public string Email { get; set; }
    public string Role { get; set; }
}
public class UserDto 
{
    public int UserID { get; set; }
    public string FullName { get; set; }

}
public class LoginRequest
{
    public string Username { get; set; }
    public string Password { get; set; }
}

