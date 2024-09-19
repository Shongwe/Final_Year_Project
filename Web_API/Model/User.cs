using Microsoft.AspNetCore.Identity;

namespace Web_API.Model
{
    public class User: IdentityUser
    {
        public string Firstname { get; set; } = string.Empty;
        public string Lastname { get; set; } = string.Empty;
        public String Address { get; set; } = string.Empty;
        public String LicenseInfo { get; set; } = string.Empty;

        public ICollection<Rental> Rentals { get; set; }
        public ICollection<Reservation> Reservations { get; set; }
        public ICollection<UserCartItem> UserCartItems { get; set; } // Many-to-many relationship


    }
}
