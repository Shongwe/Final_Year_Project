using Microsoft.AspNetCore.Identity.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore;
using Web_API.Model;

namespace Web_API.Data
{
    public class DataContext : IdentityDbContext<User>
    {
        public DataContext(DbContextOptions options) : base(options)
        {

        }
        public DbSet<Vehicle> Vehicles{get;set;}
        public DbSet<Rental> Rentals { get; set; }
        public DbSet<Payment> Payments { get; set; }
        public DbSet<MaintenanceRecord> MaintenanceRecords { get; set; }
        public DbSet<Reservation> Reservations { get; set; }
        public DbSet<VehicleStat> VehicleStats { get; set; }
        public DbSet<RevenueReport> RevenueReports { get; set; }
        public DbSet<RentalStat> RentalStats { get; set; }
        public DbSet<AvailabilityPeriod> AvailabilityPeriods { get; set; }
        public DbSet<Cart> Carts { get; set; }
        public DbSet<CartItem> CartItems { get; set; }



        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            // Customer to Rental relationship
            modelBuilder.Entity<User>()
                .HasMany(c => c.Rentals)
                .WithOne(r => r.Customer)
                .HasForeignKey(r => r.UserId)
                .OnDelete(DeleteBehavior.Cascade);

            // Vehicle to Rental relationship
            modelBuilder.Entity<Vehicle>()
                .HasMany(v => v.Rentals)
                .WithOne(r => r.Vehicle)
                .HasForeignKey(r => r.VehicleId)
                .OnDelete(DeleteBehavior.Cascade);

            // Rental to Payment relationship
            modelBuilder.Entity<Rental>()
                .HasMany(r => r.Payments)
                .WithOne(p => p.Rental)
                .HasForeignKey(p => p.RentalId)
                .OnDelete(DeleteBehavior.Cascade);

            // Vehicle to MaintenanceRecord relationship
            modelBuilder.Entity<Vehicle>()
                .HasMany(v => v.MaintenanceRecords)
                .WithOne(m => m.Vehicle)
                .HasForeignKey(m => m.VehicleId)
                .OnDelete(DeleteBehavior.Cascade);

            // Vehicle to VehicleStat relationship
            modelBuilder.Entity<Vehicle>()
                .HasMany(v => v.VehicleStats)
                .WithOne(vs => vs.Vehicle)
                .HasForeignKey(vs => vs.VehicleId)
                .OnDelete(DeleteBehavior.Cascade);

            // Customer to Reservation relationship
            modelBuilder.Entity<User>()
                .HasMany(c => c.Reservations)
                .WithOne(r => r.Customer)
                .HasForeignKey(r => r.UserId)
                .OnDelete(DeleteBehavior.Cascade);

            // Vehicle to Reservation relationship
            modelBuilder.Entity<Vehicle>()
                .HasMany(v => v.Reservations)
                .WithOne(r => r.Vehicle)
                .HasForeignKey(r => r.VehicleId)
                .OnDelete(DeleteBehavior.Cascade);

            // Vehicle to AvailabilityPeriod relationship
            modelBuilder.Entity<Vehicle>()
                .HasMany(v => v.AvailabilityPeriods)
                .WithOne(ap => ap.Vehicle)
                .HasForeignKey(ap => ap.VehicleId)
                .OnDelete(DeleteBehavior.Cascade);

             modelBuilder.Entity<CartItem>()
                .HasOne(ci => ci.User) 
                .WithMany(u => u.CartItems) 
                .HasForeignKey(ci => ci.UserId) 
                .OnDelete(DeleteBehavior.Restrict); 

            base.OnModelCreating(modelBuilder);
        }
    }
}
