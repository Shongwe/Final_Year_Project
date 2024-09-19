using System;

namespace Web_API.Model
{
    public class Cart
    {
        public int CartId { get; set; }
        public String UserId { get; set; } = string.Empty;
        public DateTime CreatedDate { get; set; } = DateTime.Now;
        public String Status { get; set; }= "Open";

        public List<CartItem> Cartitems { get; set; }

    }
}
