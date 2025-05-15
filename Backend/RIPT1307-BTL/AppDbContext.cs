using Microsoft.EntityFrameworkCore;
using RIPT1307_BTL.Common;

namespace RIPT1307_BTL.Controllers
{
    public class AppDbContext : DbContext
    {
        public AppDbContext(DbContextOptions<AppDbContext> options) : base(options) { }

        public DbSet<User> Users { get; set; } // Mặc dù bảng tên 'user', tên DbSet vẫn có thể là Users
        public DbSet<Service> Services { get; set; } // Mặc dù bảng tên 'user', tên DbSet vẫn có thể là Users
        public DbSet<Room> Rooms { get; set; } // Mặc dù bảng tên 'user', tên DbSet vẫn có thể là Users
        public DbSet<RoomService> RoomServices { get; set; } // Mặc dù bảng tên 'user', tên DbSet vẫn có thể là Users

    }
}
