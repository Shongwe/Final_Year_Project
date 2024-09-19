namespace Web_API.Model
{
    public class UserCartItem
    {
        public string UserId { get; set; }
        public User? User { get; set; }

        public int CartItemId { get; set; }
        public CartItem? CartItem { get; set; }
    }
}
