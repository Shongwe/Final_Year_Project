namespace Web_API.Model
{
    public class CartItem
    {
        public int CartItemId { get; set;}
        public int CartId { get; set;}
        public Cart? Cart { get; set; }
        public String UserId { get; set; }=string.Empty;
        public User? User { get; set; }
        public int VehicleId { get; set;}
        public Vehicle? Vehicle { get; set; }
        public DateTime StartDate { get; set;}
        public DateTime EndDate { get; set;}
        public double TotalPrice { get; set;}
        public double DailyRate { get; set;}
        public int Deleted { get; set; } = 0;

        public ICollection<UserCartItem> ?UserCartItems { get; set; } 

    }
}