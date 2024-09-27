namespace Web_API.Dto
{
    public class CartDto
    {
        public int CartId { get; set; }
        public string UserId { get; set; } = string.Empty;
        public DateTime CreatedDate { get; set; }
        public string Status { get; set; } = "Open";
        public DateTime? CheckoutDate { get; set; }
        public string? AdminUserId { get; set; }
        public List<CartItemDto> CartItems { get; set; } = new List<CartItemDto>();

    }
}
